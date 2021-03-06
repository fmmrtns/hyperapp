import { h, app } from "../src"
import { expectHTMLToBe } from "./util"

beforeEach(() => (document.body.innerHTML = ""))

test("update the state sync", () => {
  app({
    state: 1,
    view: state => h("div", {}, state),
    actions: {
      add: state => state + 1
    },
    events: {
      ready: (state, actions) => {
        actions.add()

        expectHTMLToBe(`
          <div>
            2
          </div>
        `)
      }
    }
  })
})

test("update the state async", done => {
  app({
    state: 1,
    view: state => h("div", {}, state),
    actions: {
      change: (state, actions, data) => state + data,
      delayAndChange: (state, actions, data) => {
        setTimeout(() => {
          actions.change(data)

          expectHTMLToBe(`
            <div>
              ${state + data}
            </div>
          `)

          done()
        }, 5)
      }
    },
    events: {
      ready: (state, actions) => actions.delayAndChange(Number.MAX_SAFE_INTEGER)
    }
  })
})

test("update the state async by promise", done => {
  app({
    state: 1,
    view: state => h("div", {}, state),
    actions: {
      delay: state => new Promise(resolve => setTimeout(() => resolve(), 20)),
      change: (state, actions, data) => state + data,
      delayAndChange: (state, actions, data) => {
        actions.delay().then(() => {
          actions.change(data)

          expectHTMLToBe(`
            <div>
              ${state + data}
            </div>
          `)

          done()
        })
      }
    },
    events: {
      ready: (state, actions) => actions.delayAndChange(Number.MAX_SAFE_INTEGER)
    }
  })
})

test("namespaced/nested actions", () => {
  app({
    state: true,
    view: state => "",
    actions: {
      foo: {
        bar: {
          baz: (state, actions, data) => {
            expect(state).toBe(true)
            expect(data).toBe("foo.bar.baz")
          }
        }
      }
    },
    events: {
      ready: (state, actions) => actions.foo.bar.baz("foo.bar.baz")
    }
  })
})
