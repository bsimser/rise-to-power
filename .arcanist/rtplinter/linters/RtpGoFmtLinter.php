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

final class RtpGoFmtLinter extends ArcanistLinter {

  public function getLinterName() {
    return 'GoFmtLint';
  }

  public function lintPath($path) {
    list($err, $_, $stderr) = exec_manual("gofmt -w -s %s",
        $this->getEngine()->getFilePathOnDisk($path));
    if ($err) {
      $lines = explode("\n", $stderr);
      foreach($lines as $line) {
        $matches = null;
        if(!preg_match('/[^:]+:(\d+):(\d+): (.*)$/', $line, $matches)) {
          continue;
        }
        $message = new ArcanistLintMessage();
        $message->setPath($path);
        $message->setLine($matches[1]);
        $message->setChar($matches[2]);
        $message->setName($this->getLinterName()." Parse error");
        $message->setDescription($matches[3]);
        $this->addLintMessage($message);
      }
    }
  }
}
