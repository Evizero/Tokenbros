// Encounter positions are world pixels; platforms in World use 20px cells.
export const LEVEL_ENEMIES:[number,number,string][]=[
 [430,830,'gunner'],[480,650,'gunner'],[615,710,'shield'],[745,830,'runner'],[760,570,'grenadier'],[835,710,'gunner'],[815,470,'drone'],
 [1040,770,'shield'],[1100,610,'grenadier'],[1205,690,'gunner'],[1320,750,'runner'],[1220,530,'shield'],[1095,470,'gunner'],[1355,450,'turret'],[1460,610,'gunner'],[1540,370,'shield'],[1700,290,'gunner'],[1700,200,'drone'],
 [2020,580,'drone'],[2200,710,'gunner'],[2355,570,'grenadier'],[2415,650,'shield'],[2490,510,'gunner'],[2540,830,'runner'],
 [2680,650,'shield'],[2800,750,'gunner'],[2840,450,'grenadier'],[2980,570,'turret'],[3050,370,'gunner'],[3080,710,'runner'],[3010,270,'drone'],[3160,830,'gunner'],
 [3390,710,'grenadier'],[3480,830,'shield'],[3770,710,'gunner'],[3820,510,'drone']
];
export const LEVEL_BARRELS=[
 [450,830],[520,650],[660,710],[725,570],[805,710],[875,830],
 [1070,770],[1120,610],[1260,690],[1300,530],[1430,450],[1500,610],[1560,370],[1740,290],
 [2180,710],[2270,570],[2365,570],[2470,650],[2560,510],[2600,830],
 [2710,650],[2820,750],[2870,450],[2920,570],[3000,370],[3070,710],[3170,830],[3420,710],[3520,830],[3790,710]
];
export const SECTORS=[
 {name:'01 / THE LOADING YARD',from:300,to:980,color:'#c29565',waves:[['gunner','runner','drone'],['shield','gunner','runner']],doors:[[810,740],[570,680],[850,600]]},
 {name:'02 / STACK OVERFLOW',from:980,to:1800,color:'#82a9b8',waves:[['gunner','drone','runner'],['shield','grenadier','drone']],doors:[[1050,640],[1430,640],[1640,320]]},
 {name:'03 / PACKET LOSS',from:2080,to:2580,color:'#bda174',waves:[['drone','gunner','drone']],doors:[[2240,740],[2380,600],[2510,540]]},
 {name:'04 / THE DEMOLITION PIT',from:2580,to:3220,color:'#c08473',waves:[['runner','gunner','drone'],['shield','grenadier','runner']],doors:[[2840,480],[3030,400],[3120,740]]}
];
export const SUPPLIES=[{x:815,y:710},{x:1350,y:750},{x:2370,y:830},{x:3110,y:710}];
export const FACADES:[number,number,number,number,string][]=[
 [320,600,560,260,'#25282c'],[1000,280,750,580,'#202831'],[2160,540,410,320,'#292923'],[2630,380,510,480,'#2c2428']
];
