/** @jsx jsx */

import { Box, jsx } from 'theme-ui';

import { Aligner } from '@modules/utility/';
import { Button } from '@atoms';
import QRCode from 'easyqrcodejs';
import { console } from 'window-or-global';

const QRCodeGen = ({ pad, children }) => {
  function printer() {
    var text1 = document.getElementById('QRid').value;
    var text2 = 'https://etherscan.io/address/' + text1;
    var options = {
      text: text2,
      width: 400,
      height: 400,
      backgroundImage: '/images/QRBG.png',
      backgroundImageAlpha: 1,
      logo: '/images/QRlogo.png',
      logoBackgroundTransparent: true,
      dotScale: 0.7,
      quietZone: 280,
      correctLevel: QRCode.CorrectLevel.H,
    };
    // Create QRCode Object
    var qrDiv = document.getElementById('mainDiv');
    while (qrDiv.firstChild) {
      qrDiv.removeChild(qrDiv.firstChild);
    }
    new QRCode(qrDiv, options);
  }

  return (
    <Box sx={{ pl: pad || '1rem' }}>
      {children}

      <Aligner center>
        <textarea id="QRid" name="QRinput" rows="4" cols="200"></textarea>
      </Aligner>

      <Aligner center>
        <Button onClick={printer} hideExternalIcon="true">
          Generate Your QR Code
        </Button>
      </Aligner>

      <Aligner center>
        <div className="qr" id="mainDiv">
          <canvas id="qrcode" width="0" height="58"></canvas>
        </div>
      </Aligner>
    </Box>
  );
};

export default QRCodeGen;
