export class AudioFX {
  ctx: AudioContext | null = null;
  muted = false;
  robotGeneration=0;
  start() { this.ctx??=new AudioContext(); void this.ctx.resume(); }
  tone(freq:number,duration:number,type:OscillatorType='square',gain=.045,end=0,pan=0) {
    if(!this.ctx||this.muted)return;
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,c.currentTime);
    if(end)o.frequency.exponentialRampToValueAtTime(end,c.currentTime+duration);
    g.gain.setValueAtTime(gain,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);
    const p=c.createStereoPanner();p.pan.value=pan;o.connect(g);g.connect(p);p.connect(c.destination);o.start();o.stop(c.currentTime+duration);
  }
  noise(duration:number,gain:number,filter:number) {
    if(!this.ctx||this.muted)return;
    const c=this.ctx,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=buffer;f.type='lowpass';f.frequency.value=filter;
    g.gain.value=gain;s.connect(f);f.connect(g);g.connect(c.destination);s.start();
  }
  shoot(boost:boolean,tier=0) {this.noise(tier===2?.16:.055,tier===2?.085:.045,boost?4800:3200);this.tone(tier===2?620:tier===1?310:boost?200:160,tier===2?.25:.065,'sawtooth',tier===2?.065:.027,55);if(tier===2)this.tone(70,.22,'sine',.12,30);}
  blast(big=false) {this.noise(big?.65:.3,big?.22:.13,1800);this.tone(big?90:140,big?.5:.22,'sine',.18,25);}
  impact() {this.noise(.045,.055,5400);this.tone(760,.045,'triangle',.04,190);}
  scrap(big=false) {this.noise(.18,big?.12:.08,2700);this.tone(big?110:170,.18,'triangle',.09,40);this.tone(1150,.07,'square',.018,320);}
  silenceRobots(){this.robotGeneration++;}
  setMuted(muted:boolean){this.muted=muted;if(muted)this.silenceRobots();}
  robot(kind:string,pan:number,distance:number){
    if(this.muted||!this.ctx)return;
    const generation=this.robotGeneration,gain=.009*Math.max(0,1-distance/620);
    if(gain<.001)return;
    const notes=kind==='laugh'?[230,180,210]:kind==='hurt'?[420,120]:kind==='block'?[170,290]:kind==='attack'?[260,360]:[340,520];
    notes.forEach((freq,i)=>setTimeout(()=>{if(generation!==this.robotGeneration||this.muted)return;
      this.tone(freq,.075,'triangle',gain,freq*.6,pan);this.tone(freq*2.1,.045,'sine',gain*.45,freq*1.4,pan);
    },i*90));
  }
  jump() {this.tone(160,.1,'triangle',.035,380);}
  reset() {this.blast();this.tone(180,.65,'sawtooth',.045,950);for(let i=0;i<5;i++)setTimeout(()=>this.tone(300+i*140,.16,'triangle',.06),i*65);}
  pickup() {for(let i=0;i<3;i++)setTimeout(()=>this.tone(440+i*220,.17,'triangle',.07),i*80);}
  hurt() {this.noise(.15,.1,900);this.tone(140,.2,'square',.04,50);}
}
