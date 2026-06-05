export const DPT=[{t:5,p:22785},{t:10,p:21735},{t:15,p:20580},{t:20,p:19367},{t:30,p:18228},{t:40,p:17089},{t:50,p:14810},{t:100,p:12750},{t:200,p:10800},{t:300,p:10050},{t:400,p:9450},{t:500,p:9000}];
export const DCT=[{t:1,p:79968},{t:3,p:73500},{t:5,p:67972},{t:10,p:63974},{t:15,p:59976},{t:20,p:55977},{t:30,p:51979},{t:40,p:47980},{t:50,p:43982}];
export const DHT=[{t:5,p:14000},{t:10,p:12000},{t:20,p:10000},{t:50,p:8500},{t:100,p:8000},{t:200,p:7000},{t:500,p:5000},{t:1000,p:3500}];
export const DGP=85000;
export const DPP=56000;
export const DCOSTS={past:5075,cris:7975,hong:2000,got:5000,pet:2000};
export const DEFAULT_PRODUCTS=[
  {id:'v-cal',emoji:'💀',nombre:'Calaveras',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'calaveras'},
  {id:'v-ted',emoji:'🧸',nombre:'Teddy',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'teddy'},
  {id:'v-lck',emoji:'🐱',nombre:'Lucky Cat',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'lucky'},
  {id:'v-gen',emoji:'💊',nombre:'Genéricas',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'genericas'},
  {id:'p-cris',emoji:'💎',nombre:'Cristales',unit:'g',costo:7975,tipo:'tramos',listaPrecioId:'lp-cris',
   tramos:DCT.map(x=>({...x})),activo:true,maxConsulta:60,legacyKey:'cristales'},
  {id:'p-hong',emoji:'🍄',nombre:'Hongos',unit:'g',costo:2000,tipo:'tramos',listaPrecioId:'lp-hong',
   tramos:DHT.map(x=>({...x})),activo:true,legacyKey:'hongos'},
  {id:'p-got',emoji:'💧',nombre:'Goteros',unit:'ud',costo:5000,tipo:'fijo',listaPrecioId:'lp-got',
   tramos:[{t:1,p:DGP}],activo:true,legacyKey:'goteros'},
  {id:'p-pet',emoji:'🧫',nombre:'Petri',unit:'ud',costo:2000,tipo:'fijo',listaPrecioId:'lp-pet',
   tramos:[{t:1,p:DPP}],activo:true,legacyKey:'petri'},
];
export const DEFAULT_LISTAS_PRECIOS=[
  {id:'lp-past',nombre:'Pastillas GRP',tramos:DPT.map(x=>({...x}))},
  {id:'lp-cris',nombre:'Cristales',tramos:DCT.map(x=>({...x}))},
  {id:'lp-hong',nombre:'Hongos',tramos:DHT.map(x=>({...x}))},
  {id:'lp-got',nombre:'Goteros Fijo',tramos:[{t:1,p:DGP}]},
  {id:'lp-pet',nombre:'Petri Fijo',tramos:[{t:1,p:DPP}]},
];
