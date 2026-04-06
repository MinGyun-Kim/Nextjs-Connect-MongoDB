declare module 'react-daum-postcode' {
  import { ComponentType } from 'react';

  interface DaumPostcodeProps {
    onComplete: (data: any) => void;
    autoClose?: boolean;
    style?: any;
    defaultQuery?: string;
    theme?: any;
    scriptUrl?: string;
    errorMessage?: string;
  }

  const DaumPostcode: ComponentType<DaumPostcodeProps>;

  export default DaumPostcode;
}
