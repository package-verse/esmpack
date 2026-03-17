export const ProcessOptions = {
    cwd: ""
};

const { argv } = process;
const { length } = argv;
for(let i=0; i< length;i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
        ProcessOptions[arg] = argv[i+1] || void 0;
    }
}

const last = argv[argv.length-1];

export const fileArgument = last.startsWith("--") ? void 0 : last;



ProcessOptions.cwd ||= process.cwd();
