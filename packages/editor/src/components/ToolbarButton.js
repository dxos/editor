//
// Copyright 2020 DXOS.org
//

import React from 'react';
import classnames from 'classnames';

import { withStyles } from '@material-ui/core';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import { grey } from '@material-ui/core/colors';

const styles = theme => ({
  button: {
    minWidth: 0,
    marginLeft: theme.spacing(0.3),
    marginRight: theme.spacing(0.3)
  },
  buttonActive: {
    backgroundColor: grey[200]
  },
  buttonIcon: {
    margin: 0,
    color: grey[800]
  },
  buttonIconDisabled: {
    color: grey[400]
  }
});

const ToolbarButton = ({
  children,
  icon: IconComponent,
  title,
  active = false,
  disabled = false,
  onClick,
  classes
}) => {
  return (
    <Tooltip title={title}>
      <span>
        <Button
          classes={{
            root: classnames(classes.button, active && classes.buttonActive),
            startIcon: classes.buttonIcon
          }}
          color='default'
          disabled={disabled}
          onClick={onClick}
          {...(IconComponent
            ? {
              startIcon: (
                <IconComponent
                  className={classnames(
                    !active && disabled && classes.buttonIconDisabled
                  )}
                />
              )
            }
            : {})}
        >
          {children || ' '}
        </Button>
      </span>
    </Tooltip>
  );
};

export default withStyles(styles)(ToolbarButton);
