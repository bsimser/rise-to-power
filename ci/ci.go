package main

import (
	"container/list"
	"encoding/json"
	"expvar"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
)

var (
	address       = flag.String("address", ":9090", "Address on which to listen.")
	state         = flag.String("state_path", "ci_state", "Path to file where CI saves its state.")
	hmacKey       = flag.String("hmac_key", "", "Shared secret with Google Code for webhook auth.")
	codeDir       = flag.String("code_dir", ".ci", "Absolute path to a directory to use to download, build and test code.")
	noComment     = flag.Bool("disable_commenting", false, "Disable commenting on phabricator revisions")
	jobQueue      = list.New() // List of job, used as a queue.
	jobPresent    = make(chan bool, 100)
	completedJobs []jobResult
	saveRequest   = make(chan bool)
	indexTpl      = template.Must(template.New("index").Funcs(template.FuncMap{"linkify": linkify}).Parse(indexHtml))

	numQueued    = expvar.NewInt("num_queued")
	numCompleted = expvar.NewInt("num_completed")
	statusMap    = expvar.NewMap("num_status")
)

type jobType string
type jobStatus string

const (
	TYPE_COMMIT = jobType("commit")
	TYPE_DIFF   = jobType("diff")

	STATUS_SUCCESS      = jobStatus("Success!")
	STATUS_BUILD_BROKEN = jobStatus("Build failed.")
	STATUS_TEST_FAILED  = jobStatus("Tests failed.")
	STATUS_OTHER_ISSUE  = jobStatus("The integration run failed for an unknown reason.")
)

func (j jobStatus) Status() string {
	if j == STATUS_SUCCESS {
		return "SUCCESS"
	}
	if j == STATUS_BUILD_BROKEN {
		return "BUILD_BROKEN"
	}
	if j == STATUS_TEST_FAILED {
		return "TEST_FAILED"
	}
	return "OTHER_ISSUE"
}

type job struct {
	Type     jobType
	Revision string // "A SHA for TYPE_COMMIT, a phabricator differential # for TYPE_DIFF"
}

type jobResult struct {
	Type     jobType
	Revision string
	Status   jobStatus
	Extra    string
}

// Functions that actually do the building.

func executeCommand(env map[string]string, name string, args ...string) ([]byte, error) {
	cmd := exec.Command(name, args...)
	if env != nil {
		for k, v := range env {
			cmd.Env = append(cmd.Env, fmt.Sprintf("%v=%v", k, v))
		}
	}
	return cmd.CombinedOutput()
}

func callConduit(method string, params []byte) ([]byte, error) {
	cmd := exec.Command("arc", "call-conduit", method)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	err = cmd.Start()
	if err != nil {
		return nil, err
	}
	_, err = stdin.Write(params)
	stdin.Close()
	if err != nil {
		return nil, err
	}
	result, err := ioutil.ReadAll(stdout)
	if err != nil {
		return nil, err
	}
	err = cmd.Wait()
	if err != nil {
		return nil, err
	}
	return result, nil
}

func commentOnPhabricator(c jobResult) {
	if *noComment || c.Type != TYPE_DIFF {
		return
	}

	var params []byte
	if c.Status == STATUS_SUCCESS {
		params = []byte(fmt.Sprintf(`{"revision_id": %v, "message": "CI succeeded.", "action": "none"}`, c.Revision))
	} else {
		params = []byte(fmt.Sprintf(`{"revision_id": %v, "message": "CI failed, with error: %v", "action": "reject"}`, c.Revision, c.Extra))
	}
	callConduit("differential.createcomment", params)
}

func getDiffBase(rev string) (string, error) {
	params := []byte(fmt.Sprintf(`{"ids": [%v]}`, rev))
	result, err := callConduit("differential.query", params)
	if err != nil {
		return "", err
	}
	root := make(map[string]interface{})
	err = json.Unmarshal(result, &root)
	if err != nil {
		return "", err
	}
	v, ok := root["response"]
	if !ok {
		return "", fmt.Errorf("Unable to parse json: %v", string(result))
	}
	t := v.([]interface{})
	if len(t) == 0 {
		return "", fmt.Errorf("Unable to parse json: %v", string(result))
	}
	root = t[0].(map[string]interface{})
	v, ok = root["diffs"]
	if !ok {
		return "", fmt.Errorf("Unable to parse json: %v", string(result))
	}
	diffs := v.([]interface{})
	if len(diffs) == 0 {
		return "", fmt.Errorf("No diffs found: %v", string(result))
	}
	d := diffs[0].(string)

	params = []byte(fmt.Sprintf(`{"ids": [%v]}`, d))
	result, err = callConduit("differential.querydiffs", params)
	if err != nil {
		return "", err
	}
	root = make(map[string]interface{})
	err = json.Unmarshal(result, &root)
	if err != nil {
		return "", err
	}
	v, ok = root["response"]
	if !ok {
		return "", fmt.Errorf("Unable to parse json: %v", string(result))
	}
	root = v.(map[string]interface{})
	v, ok = root[d]
	if !ok {
		return "", fmt.Errorf("Unable to parse json: %v", string(result))
	}
	root = v.(map[string]interface{})
	v, ok = root["sourceControlBaseRevision"]
	if !ok {
		return "", fmt.Errorf("Unable to parse json: %v", string(result))
	}
	return v.(string), nil
}

func (j *job) doJob() jobResult {
	targetDir := path.Join(*codeDir, "src/code.google.com/p")
	path := os.Getenv("PATH")
	result := jobResult{}
	result.Type = j.Type
	result.Revision = j.Revision
	fi, err := os.Stat(targetDir)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Fatal(err)
		}
		if err = os.MkdirAll(targetDir, 0755); err != nil {
			log.Fatal(err)
		}
		if fi, err = os.Stat(targetDir); err != nil {
			log.Fatal(err)
		}
	}
	if !fi.IsDir() {
		log.Fatalf("Destination directory %v is not a directory!", targetDir)
	}
	if err = os.Chdir(targetDir); err != nil {
		log.Fatal(err)
	}
	fi, err = os.Stat("rise-to-power")
	if err == nil || os.IsExist(err) {
		if err = os.RemoveAll("rise-to-power"); err != nil {
			log.Fatal(err)
		}
	}
	_, err = executeCommand(nil, "git", "clone", "https://code.google.com/p/rise-to-power")
	if err != nil {
		log.Fatal(err)
	}
	if err = os.Chdir("rise-to-power"); err != nil {
		log.Fatal(err)
	}
	if j.Type == TYPE_DIFF {
		base, err := getDiffBase(j.Revision)
		if err != nil {
			result.Status = STATUS_OTHER_ISSUE
			result.Extra = err.Error()
			return result
		}
		out, err := executeCommand(nil, "git", "reset", "--hard", base)
		if err != nil {
			result.Status = STATUS_OTHER_ISSUE
			result.Extra = string(out)
			return result
		}
		out, err = executeCommand(nil, "git", "clean", "-fdx")
		if err != nil {
			result.Status = STATUS_OTHER_ISSUE
			result.Extra = string(out)
			return result
		}
		out, err = executeCommand(nil, "arc", "patch", "--force", "--nobranch", "--nocommit", fmt.Sprintf("D%v", j.Revision))
		if err != nil {
			result.Status = STATUS_OTHER_ISSUE
			result.Extra = string(out)
			return result
		}
	} else {
		out, err := executeCommand(nil, "git", "reset", "--hard", j.Revision)
		if err != nil {
			result.Status = STATUS_OTHER_ISSUE
			result.Extra = string(out)
			return result
		}
		out, err = executeCommand(nil, "git", "clean", "-fdx")
		if err != nil {
			result.Status = STATUS_OTHER_ISSUE
			result.Extra = string(out)
			return result
		}
	}

	goEnvMap := map[string]string{
		"GOPATH": *codeDir,
		"PATH":   path,
	}

	// Fetch dependencies and build
	out, err := executeCommand(goEnvMap, "go", "get", "./...")
	if err != nil {
		result.Status = STATUS_BUILD_BROKEN
		result.Extra = string(out)
		return result
	}
	// Run tests
	out, err = executeCommand(goEnvMap, "go", "test", "./...")
	if err != nil {
		result.Status = STATUS_TEST_FAILED
		result.Extra = string(out)
		return result
	}
	result.Status = STATUS_SUCCESS
	result.Extra = string(out)
	return result
}

func builder() {
	for {
		_ = <-jobPresent
		for jobQueue.Len() > 0 {
			e := jobQueue.Front()
			j := e.Value.(job)
			c := j.doJob()
			commentOnPhabricator(c)
			completedJobs = append(completedJobs, c)
			jobQueue.Remove(e)
			saveRequest <- true
			numQueued.Add(-1)
			statusMap.Add(c.Status.Status(), 1)
			numCompleted.Add(1)
		}
	}
}

// URL Handlers

func queueHandler(w http.ResponseWriter, r *http.Request) {
	id := path.Base(r.URL.Path)
	if id == "." || id == "/" {
		http.Error(w, "No diffId found!", 400)
		return
	}
	jobQueue.PushBack(job{Type: TYPE_DIFF, Revision: id})
	jobPresent <- true
	saveRequest <- true
	w.Write([]byte(fmt.Sprintf("Queued build request for diff ID %v", id)))
	numQueued.Add(1)
}

func commitHandler(w http.ResponseWriter, r *http.Request) {
	id := path.Base(r.URL.Path)
	if id == "." || id == "/" {
		http.Error(w, "No revision found!", 400)
		return
	}
	jobQueue.PushBack(job{Type: TYPE_COMMIT, Revision: id})
	jobPresent <- true
	saveRequest <- true
	w.Write([]byte(fmt.Sprintf("Queued build request for revision ID %v", id)))
	numQueued.Add(1)
}

type indexData struct {
	Completed []jobResult
	Queued    []job
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	queue := make([]job, 0, jobQueue.Len())
	for e := jobQueue.Front(); e != nil; e = e.Next() {
		queue = append(queue, job(e.Value.(job)))
	}
	err := indexTpl.Execute(w, indexData{Completed: completedJobs, Queued: queue})
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

// State Persistance

func restoreState() {
	s, err := ioutil.ReadFile(*state)
	if err != nil {
		log.Fatalf("Unable to read state file %v.", *state)
	}
	if len(s) == 0 {
		log.Printf("State file %v was empty. Continuing.", *state)
		return
	}
	d := indexData{}
	err = json.Unmarshal(s, &d)
	if err != nil {
		log.Fatal(err)
		return
	}
	completedJobs = d.Completed
	for _, cj := range completedJobs {
		statusMap.Add(cj.Status.Status(), 1)
	}
	numCompleted.Set(int64(len(completedJobs)))
	for _, j := range d.Queued {
		jobQueue.PushBack(j)
	}
	numQueued.Set(int64(jobQueue.Len()))
	jobPresent <- true
}

func saveState() {
	queue := make([]job, 0, jobQueue.Len())
	for e := jobQueue.Front(); e != nil; e = e.Next() {
		queue = append(queue, job(e.Value.(job)))
	}
	s, err := json.Marshal(indexData{Completed: completedJobs, Queued: queue})
	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile(*state, s, 0644)
	if err != nil {
		log.Fatal(err)
	}
}

func saver() {
	for {
		_ = <-saveRequest
		saveState()
	}
}

// Initialization

func setupEnvironment() {
	fi, err := os.Stat(*codeDir)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Fatal(err)
		}
		if err = os.Mkdir(*codeDir, 0755); err != nil {
			log.Fatal(err)
		}
		if err = os.Mkdir(path.Join(*codeDir, "bin"), 0755); err != nil {
			log.Fatal(err)
		}
		if err = os.MkdirAll(path.Join(*codeDir, "src"), 0755); err != nil {
			log.Fatal(err)
		}
		if err = os.Mkdir(path.Join(*codeDir, "pkg"), 0755); err != nil {
			log.Fatal(err)
		}
		if fi, err = os.Stat(*codeDir); err != nil {
			log.Fatal(err)
		}
	}
	if !fi.IsDir() {
		log.Fatalf("Path %v is not a dir!", *codeDir)
	}
}

func main() {
	flag.Parse()
	r, err := filepath.Abs(*state)
	if err != nil {
		log.Fatal(err)
	}
	*state = r
	r, err = filepath.Abs(*codeDir)
	if err != nil {
		log.Fatal(err)
	}
	*codeDir = r
	restoreState()
	setupEnvironment()

	http.HandleFunc("/enqueue/", queueHandler)
	http.HandleFunc("/commit/", commitHandler)
	http.HandleFunc("/", indexHandler)

	go saver()
	go builder()
	http.ListenAndServe(*address, nil)
}

// Index Template

func linkify(revision string, rtype jobType) string {
	if rtype == TYPE_COMMIT {
		return fmt.Sprintf("https://d.sil.as/rRTPG%v", revision)
	} else if rtype == TYPE_DIFF {
		return fmt.Sprintf("http://d.sil.as/D%v", revision)
	}
	return ""
}

const indexHtml = `
<html>
	<head>
		<title>CI Dashboard</title>
	</head>
	<body>
		<h1>Completed</h1>
		<table>
			<tr><th>Type</th><th>Revision</th><th>Status</th></tr>
			{{range .Completed}}
			<tr><td>{{.Type}}</td><td><a href="{{linkify .Revision .Type}}">{{.Revision}}</a></td><td>{{.Status}}</td></tr>
			{{end}}
		</table>
		<h1>Queued</h1>
		<table>
			<tr><th>Type</th><th>Revision</th></tr>
			{{range .Queued}}
			<tr><td>{{.Type}}</td><td><a href="{{linkify .Revision .Type}}">{{.Revision}}</a></td></tr>
			{{end}}
		</table>
	</body>
</html>
`
