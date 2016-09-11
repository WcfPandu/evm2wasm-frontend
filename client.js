const choo = require('choo')
const html = require('choo/html')
const sf = require('sheetify')
const evm2wasm = require('evm2wasm')
const ethUtil = require('ethereumjs-util')
const app = choo()

// add global css
sf('./client.css', { global: true })

const scroll = sf`
  :host {
    overflow: scroll;
    width: 70%;
  }`

const demoEVMcode = '0x60606040526000357c010000000000000000000000000000000000000000000000000000000090048063771602F7146037576035565b005b60546004808035906020019091908035906020019091905050606A565b6040518082815260200191505060405180910390f35b6000818301905080505b9291505056'
const demoWastCode = compileEVM(demoEVMcode, true)

app.model({
  state: {
    evmCode: demoEVMcode,
    wastCode: demoWastCode,
    inlineOps: true
  },
  reducers: {
    compile: (data, state) => ({
      evmCode: data,
      wastCode: compileEVM(data, state.inlineOps)
    }),
    toggle: (data, state) => ({
      inlineOps: !state.inlineOps
    })
  }
})

const mainView = (state, prev, send) => html `
  <main>
    <h1>EVM 2 EWASM</h1>
    <div>
      <textarea rows="50"cols="50"onkeypress=${(e) => send('compile', e.target.value)}>${demoEVMcode}</textarea>
      <br>
      <input type="checkbox" checked=${state.inlineOps} onchange=${(e) => {
        send('toggle')
        send('compile', state.evmCode)
      }}></input>inline EVM opcodes
    </div>
    <div class=${scroll}>
      <code>${state.wastCode}</code>
    </div>
  </main>`

app.router((route) => [
  route('/', mainView)
])

const tree = app.start()
document.body.appendChild(tree)

function compileEVM (evm, inlineOps) {
  return evm2wasm.compileEVM(ethUtil.toBuffer(evm), {
    inlineOps: inlineOps,
    pprint: true
  })
}
