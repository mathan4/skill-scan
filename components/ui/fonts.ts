import { Merriweather, Lato } from 'next/font/google';

const merriweather = Merriweather({
    subsets: ['latin'], variable: '--font-merriweather',
    weight: '300'
});
const lato = Lato({
    subsets: ['latin'], variable: '--font-lato',
    weight: '300'
});

export{merriweather,lato};