//
// Copyright 2020 DXOS.org
//

import { Doc, applyUpdate } from 'yjs';
import { ySyncPluginKey, ySyncPlugin, yCursorPlugin } from 'y-prosemirror';
import ColorHash from 'color-hash';

import Provider from './provider';

const colorHash = new ColorHash();

const createSyncTextPlugin = (doc, onLocalUpdate = () => null) => {
  doc.on('update', (update, origin) => {
    const local = origin === ySyncPluginKey; // This is a y-prosemirror thing

    if (!local) return;

    onLocalUpdate(update, doc);
  });

  const plugin = ySyncPlugin(doc.getXmlFragment('content'));

  const handler = {
    doc,
    processRemoteUpdate (update, origin) {
      const uIntArrayUpdate = update.constructor === Uint8Array
        ? update
        : new Uint8Array(Object.values(update));

      applyUpdate(doc, uIntArrayUpdate, origin);
    }
  };

  return {
    plugin,
    handler
  };
};

const cursorBuilder = user => {
  const color = colorHash.hex(user.user.id);
  const cursor = window.document.createElement('span');
  cursor.className = 'cursor';
  cursor.style.borderColor = color;
  cursor.style.backgroundColor = color;

  const cursorName = window.document.createElement('span');
  cursorName.className = 'name';
  cursorName.style.backgroundColor = color;
  cursorName.innerText = user.name;

  cursor.appendChild(cursorName);

  return cursor;
};

const createStatusPlugin = (id, doc, status) => {
  const provider = new Provider(doc);

  // Send updates out
  provider.on('local-update', status.onLocalUpdate);

  // Initial state
  provider.awareness.setLocalStateField(
    'user',
    { id }
  );

  // Cursor indicator plugin
  const plugin = yCursorPlugin(provider.awareness, ({ cursorBuilder }));

  const handler = {
    processRemoteUpdate: provider.processRemoteUpdate.bind(provider),
    setUserName: (name) => {
      provider.awareness.setLocalStateField('user', { ...provider.awareness.getLocalState(), name });
    }
  };

  return { plugin, handler };
};

export const createSyncPlugins = (options, plugins) => {
  const { id, doc = new Doc(), onLocalUpdate, status } = options;

  const { plugin: syncPlugin, handler } = createSyncTextPlugin(doc, onLocalUpdate);
  plugins.push(syncPlugin);

  // const undoPlugin = yUndoPlugin({ trackedOrigins: [({}).constructor] });
  // plugins.push(undoPlugin);

  // keysToMap['Mod-z'] = undo;
  // keysToMap['Mod-y'] = redo;
  // keysToMap['Mod-Shift-z'] = redo;

  if (options.status) {
    const { plugin, handler: statusHandler } = createStatusPlugin(id, doc, status);
    plugins.push(plugin);
    handler.status = statusHandler;
  }

  return handler;
};
