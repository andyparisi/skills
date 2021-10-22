import { Component } from 'react';
import { createPortal } from 'react-dom';

class Overlay extends Component {
  render() {
    const targetEl = document.getElementById('overlay');
    return targetEl == null ? null : createPortal(this.props.children, targetEl)
  }
}

export default Overlay;
