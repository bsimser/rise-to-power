// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package session

import (
	"encoding/json"
	"fmt"

	"github.com/coreos/go-etcd/etcd"
)

const etcdFormatStr = "session_storage/%v"

type etcdSessionStore struct {
	client *etcd.Client
}

func NewEtcdStore(etcdAddr string) Store {
	return &etcdSessionStore{
		client: etcd.NewClient([]string{etcdAddr}),
	}
}

func (s *etcdSessionStore) Get(name string) (*Session, error) {
	resp, err := s.client.Get(fmt.Sprintf(etcdFormatStr, name), false, false)
	if err != nil {
		return nil, err
	}
	session := new(Session)
	err = json.Unmarshal([]byte(resp.Node.Value), session)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *etcdSessionStore) Save(sess *Session) error {
	value, err := json.Marshal(sess)
	if err != nil {
		return err
	}
	_, err = s.client.Set(fmt.Sprintf(etcdFormatStr, sess.ID), string(value), 2592000)
	return err
}

func (s *etcdSessionStore) StartSession(name string) (*Session, error) {
	session := New(name)
	err := s.Save(session)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *etcdSessionStore) EndSession(name string) error {
	_, err := s.client.Delete(name, false)
	return err
}
