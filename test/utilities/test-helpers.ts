import { TextEncoder } from 'util';

export class TestHelpers {
  static initTextEncoder() {
    global.TextEncoder = TextEncoder;
  }
}

export default TestHelpers;
