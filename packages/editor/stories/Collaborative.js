//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import { EVENT_DOC_UPDATE, Document } from '@wirelineio/document';

import { Channel, Editor } from '../src';

import { styles } from './styles';

class Collaborative extends Component {
  static count = 0;

  state = {
    peers: undefined,
    messages: []
  };

  componentDidMount() {
    const { peers: peersCount = 1 } = this.props;

    const peers = Array.from({ length: peersCount }).reduce((peers, current, index) => {
      const peerId = 'peer-' + index;
      peers[peerId] = this.createPeer(peerId);
      return peers;
    }, {});

    this.setState({ peers });
  }

  createPeer = peerId => {

    const document = Document.create();

    document.on(EVENT_DOC_UPDATE, ({ update, origin }) => {
      const { peers } = this.state;

      const local = origin === null; // This is a y-prosemirror thing

      if (!local) return;

      Object.values(peers)
        .filter(peer => peer.id !== peerId)
        .forEach(peer => {
          // New origin: avoid loop
          peer.document.applyUpdate(update, { author: peerId });
        });
    });

    const statusChannel = new Channel();
    statusChannel.on('local', data => {
      const { peers } = this.state;

      Object.values(peers)
        .filter(peer => peer.id !== peerId)
        .forEach(peer => {
          peer.statusChannel.receive(data);
        });
    });

    return {
      id: peerId,
      username: peerId,
      document,
      statusChannel
    };
  };

  handleGetUsername = peerId => id => {
    const { peers } = this.state;

    if (!id) {
      return peers[peerId].username;
    }

    return peers[id].username;
  };

  handleCreated = peerId => ({ view }) => {
    const { peers } = this.state;

    const newPeers = { ...peers };
    newPeers[peerId].view = view;

    this.setState({ peers: newPeers });
  };

  render() {
    const { classes } = this.props;
    const { peers } = this.state;

    if (!peers) {
      return 'Loading...';
    }

    const components = Object.values(peers).map(peer => (
      <div key={peer.id} className={classes.container}>
        <Editor
          schema="full"
          onCreated={this.handleCreated(peer.id)}
          toolbar
          sync={{
            document: peer.document,
            status: {
              channel: peer.statusChannel,
              getUsername: this.handleGetUsername(peer.id)
            }
          }}
        />
      </div>
    ));

    return (
      <div className={classes.root}>
        {components}
      </div>
    );
  }
}

export default withStyles(styles)(Collaborative);