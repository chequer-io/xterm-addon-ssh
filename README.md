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
const sshAddon = new SshAddon(webSocket, {
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
import { SshAddon } from 'xterm-addon-ssh';
import * as SockJS from 'sockjs-client';

const sockjs = new SockJS('wss://127.0.0.1:8090');

const Term: React.FC = () => {
  const terminalRef = useRef<QPXterm | null>();
  const sshAddon = React.useRef(
    new SshAddon(webSocket, {
      serverUuid: '123e4567-e89b-12d3-a456-426614174000',
      header: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
      connectImmediately: true,
    }),
  ).current;

  const onDidMount = React.useCallback((terminal: QPXterm) => {
    terminalRef.current = terminal;
  }, []);

  return <QPXterm onDidMount={onDidMount} addons={[sshAddon]} />;
};

export default Term;
```
