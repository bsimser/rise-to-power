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

class CIDiffEventListener extends PhutilEventListener {

  public function register() {
    $this->listen(ArcanistEventType::TYPE_DIFF_WASCREATED);
  }

  public function handleEvent(PhutilEvent $event) {
    $diff_id = $event->getValue('diffID');

    $ci_uri = $workflow->getConfigFromWhateverSourceAvailiable('rtpci.uri');

    if (!$ci_uri) {
      return;
    }

    $url = $ci_uri."/enqueue/".$diff_id;

    file_get_contents($url);
  }
}
