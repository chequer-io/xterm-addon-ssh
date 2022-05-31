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

const sockjs = new SockJS('wss://127.0.0.1:8090');

const terminal = new Terminal();
const SshAddon = new SshAddon(webSocket);
terminal.loadAddon(attachAddon);
```

- React with Typescript

```typescript jsx
import * as React from 'react';
import { QPXterm } from 'qp-xtermjs';
import { SshAddon } from 'xterm-addon-ssh';

const sockjs = new SockJS('wss://127.0.0.1:8090');

const Term: React.FC = () => {
  const terminalRef = useRef<QPXterm | null>();
  const sshAddon = React.useRef(new SshAddon(webSocket)).current;

  const onDidMount = React.useCallback((terminal: QPXterm) => {
    terminalRef.current = terminal;
  }, []);

  return <QPXterm onDidMount={onDidMount} addons={[sshAddon]} />;
};

export default Term;
```
