import { Component } from 'react';
import { createPortal } from 'react-dom';

class Overlay extends Component {
  render() {
    const { visible } = this.props;
    const targetEl = document.getElementById('skillTooltipOverlay');
    if (visible) {
      targetEl.classList.add('visible');
    }
    else {
      targetEl.classList.remove('visible');
    }
    return createPortal(this.props.children, targetEl)
  }
}

export default Overlay;
