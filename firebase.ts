import { initializeApp } from 'firebase/app';
import { clientConfig } from './config/config';

export const app = initializeApp(clientConfig);