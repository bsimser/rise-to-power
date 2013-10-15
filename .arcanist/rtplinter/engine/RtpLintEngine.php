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

final class RtpLintEngine extends ArcanistLintEngine {

  public function buildLinters(){
    $paths = $this->getPaths();
    $gofmt = new RtpGoFmtLinter();
    $newlinelint = new RtpNewlineLinter();

    foreach($paths as $key => $path) {
      // Paths can include deleted files. Since we're only interested in linting
      // file contents, we can ignore those paths.
      if(!$this->pathExists($path)) {
        continue;
      }
      if(basename($path) == ".phutil_module_cache") continue;
      $newlinelint->addPath($path);
      if (!preg_match('/\.go$/', $path)) {
        // This isn't a go file, so don't gofmt it.
        continue;
      }
      $gofmt->addPath($path);
    }
    return array($gofmt, $newlinelint);
  }
}
