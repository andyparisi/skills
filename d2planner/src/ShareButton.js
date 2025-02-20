import ReactTooltip from "react-tooltip";

import shareImage from './assets/share.png';
import './ShareButton.css'

function ShareButton (props) {
  return (
    <div className='shareButton'>
      <button
        data-tip
        data-for='shareButtonTip'
        className='shareButton'
      >
        <img className='shareImage' src={shareImage} alt='Share Build'/>
      </button>
      <ReactTooltip
        id='shareButtonTip'
        place='top'
        effect='solid'
        event='click'
        eventOff='mouseleave'
        afterShow={() => navigator.clipboard.writeText(`https://www.purediablo.com/diablo-2/skillplanner/?b=${props.buildString}`)}
        delayHide={500}
        type='light'
        textColor='#404040'
      >
        <p className='resetTipText'>
          Copied to<br/>clipboard!
        </p>
      </ReactTooltip>
    </div>
  );
}

export default ShareButton;
