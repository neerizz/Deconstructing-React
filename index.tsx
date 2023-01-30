const React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag === 'function') {
      try {
        return tag(props);
      } catch ({ promise, key }) {
        promise().then(data => {
          promiseCache.set(key, data)
          rerender()
        });
        return { tag: 'h1', props: { children: ['I AM LOADING'] } };
      }
    }
    const element = { tag, props: { ...props, children } };
    return element;
  }
}

const states = [];
let stateCursor = 0;

const useState = (initialState) => {
  const FROZEN_CURSOR = stateCursor;
  states[FROZEN_CURSOR] = states[FROZEN_CURSOR] || initialState;
  const setState = (newState) => {
    states[FROZEN_CURSOR] = newState;
    rerender();
  }
  stateCursor++;
  return [states[FROZEN_CURSOR], setState];
}

const promiseCache = new Map();

const createResource = (promise, key) => {
  if (promiseCache.has(key)) {
    return promiseCache.get(key);
  }

  throw { promise, key };
}

const App = () => {
  const [name, setName] = useState('john');
  const [count, setCount] = useState(0);
  const dogPhotoUrl = createResource(() => fetch('https://dog.ceo/api/breeds/image/random')
    .then(data => data.json())
    .then(payload => payload.message), 'dogPhoto');
  return (
    <div>
      <p>hello, {name}</p>
      <input type='text' value={name} onchange={e => setName(e.target.value)} placeholder='meow' width='100' />
      <br />
      <img src={dogPhotoUrl} />
      <div>
        <p>The count is { count }</p>
        <button onclick={() => setCount(count + 1)} >+</button>
        <button onclick={() => setCount(count - 1)} >-</button>
      </div>
      <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum numquam iusto soluta molestiae laboriosam harum non nobis, assumenda amet, sunt tenetur esse voluptate corrupti molestias quidem commodi rerum culpa tempora?</h1>
    </div>
  )
}

const render = (reactElement, container) => {
  if (['string', 'number'].includes(typeof reactElement)) {
    container.appendChild(document.createTextNode(reactElement));
    return;
  }

  const actualDomElement = document.createElement(reactElement.tag);
  if (reactElement.props) {
    Object.keys(reactElement.props).filter(p => p !== 'children').forEach(p => actualDomElement[p] = reactElement.props[p]);
  }
  if (reactElement.props.children) {
    reactElement.props.children.forEach(child => render(child, actualDomElement));
  }
  container.appendChild(actualDomElement);
}

render(<App />, document.querySelector('#app'));

const rerender = () => {
  stateCursor = 0;
  document.querySelector('#app').firstChild.remove();
  render(<App />, document.querySelector('#app'));
}