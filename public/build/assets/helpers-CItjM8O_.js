function i(t){if(!t)return"-";const e=new Date(t);return isNaN(e.getTime())?"-":e.toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"})}export{i as f};
