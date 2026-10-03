import React from 'react';
import { PaperExpressLogo, PaperExpressLogoProps } from './PaperExpressLogo';

export type StudyProLogoProps = PaperExpressLogoProps;

export const StudyProLogo: React.FC<StudyProLogoProps> = (props) => {
  return <PaperExpressLogo {...props} />;
};
