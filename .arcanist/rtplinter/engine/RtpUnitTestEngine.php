<?php
/* Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

final class RtpUnitTestEngine extends ArcanistBaseUnitTestEngine {
  public function run() {
    $go_results = $this->runGo();
    $js_results = $this->runJs();
    return array_merge($go_results, $js_results);
  }
  
  public function runGo() {
    $old_dir = getcwd();
    chdir($this->getWorkingCopy()->getProjectRoot());
    list($err, $stdout, $_) = exec_manual("go test -v ./...");
    chdir($old_dir);

    $parser = new GoTestResultParser();
    return $parser->parseTestResults("", $stdout);
  }
  
  public function runJs() {
    // First, check to see if karma is on $PATH:
    list($err, $stdout, $_) = exec_manual("which karma");
    if ($err != 0) {
      $result = new ArcanistUnitTestResult();
      $result->setName("Karma not found. Skipping js tests...");
      $result->setResult(ArcanistUnitTestResult::RESULT_SKIP);
      $result->setDuration(0);
      return array($result);
    }
    
    // Karma IS on the path.
    $old_dir = getcwd();
    $project_root = $this->getWorkingCopy()->getProjectRoot();
    chdir($project_root . '/client/js');
    exec_manual("karma start karma-conf-oneshot.js");
    chdir($old_dir);
    
    // Read from the text-results.xml file.
    $xml = file_get_contents($project_root . '/client/test-results.xml');
    $doc = new SimpleXMLElement($xml);
    // Destroy the test-results.xml file.
    unlink($project_root . '/client/test-results.xml');
    
    // Extract all the test cases.
    $results = array();
    foreach ($doc->testsuite as $suite) {
      $suite_name = $suite['name'];
      foreach ($suite->testcase as $case) {
        $case_name = $case['name'];
        $time = $case['time'];
        $fixture_name = substr($case['classname'], strlen($suite_name) + 1);
        // Did we fail?
        $failure = (string)$case->failure;
        // Convert each to a ArcanistUnitTestResult
        $result = new ArcanistUnitTestResult();
        $result->setName($fixture_name . ' ' . $case_name);
        $result->setResult($failure ? ArcanistUnitTestResult::RESULT_FAIL : ArcanistUnitTestResult::RESULT_PASS);
        $result->setUserData($failure);
        $result->setDuration($time);
        
        $results[] = $result;
      }
    }    
    
    return $results;
  }
  
  private function log($pattern /* , $arg, ... */) {
    $console = PhutilConsole::getConsole();
    $argv = func_get_args();
    $argv[0] .= "\n";
    call_user_func_array(array($console, 'writeErr'), $argv);
  }
}
