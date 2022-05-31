[![version](https://img.shields.io/npm/v/xterm-addon-ssh)](https://github.com/chequer-io/xterm-addon-ssh)
[![downloads](https://img.shields.io/npm/dm/xterm-addon-ssh)](https://github.com/chequer-io/xterm-addon-ssh)
[![license](https://img.shields.io/npm/l/xterm-addon-ssh)](https://github.com/chequer-io/xterm-addon-ssh)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/xterm-addon-ssh)](https://github.com/chequer-io/xterm-addon-ssh)

# xterm-addon-ssh

## Overview

It forwards to socket server for communicate via ssh.

## Install

```shell
npm install --save xterm-addon-ssh
```

## Usage

- Javascript

```typescript
import { Terminal } from 'xterm';
import { SshAddon } from 'xterm-addon-ssh';
import * as SockJS from 'sockjs-client';

const sockjs = new SockJS('wss://127.0.0.1:8090');

const terminal = new Terminal();
const sshAddon = new SshAddon(sockjs, {
  serverUuid: '123e4567-e89b-12d3-a456-426614174000',
  header: {
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  connectImmediately: true,
});

terminal.loadAddon(sshAddon);
```

- React with Typescript

```typescript jsx
import * as React from 'react';
import { QPXterm } from 'qp-xtermjs';
import { SshAddon, TerminalKeyEvent } from 'xterm-addon-ssh';
import * as SockJS from 'sockjs-client';

const sockjs = new SockJS('wss://127.0.0.1:8090');

const Term: React.FC = () => {
  const terminalRef = useRef<QPXterm | null>();
  const sshAddon = React.useRef(
    new SshAddon(sockjs, {
      serverUuid: '123e4567-e89b-12d3-a456-426614174000',
      header: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
      connectImmediately: true,
      onKey: console.log,
    }),
  ).current;

  const onDidMount = React.useCallback((terminal: QPXterm) => {
    terminalRef.current = terminal;
  }, []);

  React.useEffect(() => {
    const callback = (event: Event | TerminalKeyEvent) => {
      console.log(event);
    };

    sshAddon.addEventListener('connect', callback);
    sshAddon.addEventListener('message', callback);
    sshAddon.addEventListener('key', callback);
    sshAddon.addEventListener('error', callback);
    sshAddon.addEventListener('close', callback);

    return () => {
      sshAddon.removeEventListener('connect', callback);
      sshAddon.removeEventListener('message', callback);
      sshAddon.removeEventListener('key', callback);
      sshAddon.removeEventListener('error', callback);
      sshAddon.removeEventListener('close', callback);
    };
  }, []);

  React.useEffect(() => {
    return () => {
      sshAddon.removeAllListeners();
    };
  });

  return <QPXterm onDidMount={onDidMount} addons={[sshAddon]} />;
};

export default Term;
```
