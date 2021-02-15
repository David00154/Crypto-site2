
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.31.0 */

    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix) {
    				if (typeof prefix == "string" && path.startsWith(prefix)) {
    					path = path.substr(prefix.length) || "/";
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});
    	}
    }

    /* src\components\Nav.svelte generated by Svelte v3.31.0 */

    function create_else_block$1(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			a.textContent = "Logout";
    			attr(a, "href", "#");
    			attr(a, "class", "text-white text-base font-medium text-min");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (!mounted) {
    				dispose = listen(a, "click", /*click_handler_2*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (57:8) {#if !_auth}
    function create_if_block$1(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			a.textContent = "Sign up";
    			attr(a, "class", "text-white text-base font-medium text-min");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (!mounted) {
    				dispose = listen(a, "click", /*click_handler_1*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let section;
    	let span0;
    	let t1;
    	let div0;
    	let button0;
    	let t3;
    	let button1;
    	let t4;
    	let nav;
    	let div3;
    	let a;
    	let t6;
    	let button2;
    	let t8;
    	let div2;
    	let div1;
    	let button3;
    	let span1;
    	let button3_class_value;
    	let t10;
    	let button4;
    	let span2;
    	let button4_class_value;
    	let t12;
    	let button5;
    	let span3;
    	let button5_class_value;
    	let t14;
    	let button6;
    	let span4;
    	let button6_class_value;
    	let t16;
    	let button7;
    	let span5;
    	let button7_class_value;
    	let t18;
    	let button8;
    	let div2_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*_auth*/ ctx[1]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			section = element("section");
    			span0 = element("span");
    			span0.textContent = "Opening Hours: 24Hours";
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Login";
    			t3 = space();
    			button1 = element("button");
    			if_block.c();
    			t4 = space();
    			nav = element("nav");
    			div3 = element("div");
    			a = element("a");
    			a.innerHTML = `<h2 class="roboto text-gray-900 font-semibold text-4xl lg:text-5xl uppercase">Etoro</h2>`;
    			t6 = space();
    			button2 = element("button");
    			button2.innerHTML = `<i class="material-icons text-3xl font-bold">menu</i>`;
    			t8 = space();
    			div2 = element("div");
    			div1 = element("div");
    			button3 = element("button");
    			span1 = element("span");
    			span1.textContent = "Home";
    			t10 = space();
    			button4 = element("button");
    			span2 = element("span");
    			span2.textContent = "Investment Plans";
    			t12 = space();
    			button5 = element("button");
    			span3 = element("span");
    			span3.textContent = "Dashboard";
    			t14 = space();
    			button6 = element("button");
    			span4 = element("span");
    			span4.textContent = "About";
    			t16 = space();
    			button7 = element("button");
    			span5 = element("span");
    			span5.textContent = "Contact Us";
    			t18 = space();
    			button8 = element("button");
    			button8.textContent = "Get Started";
    			attr(span0, "class", "text-white text-base font-medium");
    			set_style(button0, "outline", "none");
    			attr(button0, "class", "text-white text-base font-medium mr-2 text-min");
    			set_style(button1, "outline", "none");
    			attr(section, "class", "flex bg-gray-800 flex-row justify-between px-3 py-2 sticky");
    			attr(a, "href", "/#/");
    			attr(a, "class", "p-2 mr-4 inline-flex items-center");
    			set_style(button2, "outline", "none");
    			attr(button2, "class", "rounded lg:hidden text-gray-700 inline-flex p-3");
    			set_style(button3, "outline", "none");

    			attr(button3, "class", button3_class_value = "lg:inline-flex flex lg:w-auto text-xl\n            " + (/*$location*/ ctx[2] === "/"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + " \n            px-2 py-1  text-gray-900 font-normal\n            hover:text-white hover:bg-gray-900 mr-2 roboto");

    			set_style(button4, "outline", "none");

    			attr(button4, "class", button4_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/investment-plans-page"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + "\n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto");

    			set_style(button5, "outline", "none");

    			attr(button5, "class", button5_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/portal/dashboard"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + "\n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto");

    			set_style(button6, "outline", "none");

    			attr(button6, "class", button6_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/about"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + " \n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto");

    			set_style(button7, "outline", "none");

    			attr(button7, "class", button7_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/contact"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + " \n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto");

    			set_style(button8, "outline", "none");
    			attr(button8, "class", "px-3 py-2 text-white roboto bg-gray-900 rounded");
    			attr(div1, "class", "lg:flex-row lg:inline-flex flex flex-col");
    			attr(div2, "class", div2_class_value = "" + ((/*menu*/ ctx[0] === true ? "block" : "hidden") + " w-full lg:inline-flex lg:flex-row lg:w-auto"));
    			attr(div3, "class", "container mx-auto flex flex-wrap lg:items-center justify-between");
    			attr(nav, "class", "top-0 flex items-center bg-white px-6 py-5 shadow-md flex-wrap");
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);
    			append(section, span0);
    			append(section, t1);
    			append(section, div0);
    			append(div0, button0);
    			append(div0, t3);
    			append(div0, button1);
    			if_block.m(button1, null);
    			insert(target, t4, anchor);
    			insert(target, nav, anchor);
    			append(nav, div3);
    			append(div3, a);
    			append(div3, t6);
    			append(div3, button2);
    			append(div3, t8);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, button3);
    			append(button3, span1);
    			append(div1, t10);
    			append(div1, button4);
    			append(button4, span2);
    			append(div1, t12);
    			append(div1, button5);
    			append(button5, span3);
    			append(div1, t14);
    			append(div1, button6);
    			append(button6, span4);
    			append(div1, t16);
    			append(div1, button7);
    			append(button7, span5);
    			append(div1, t18);
    			append(div1, button8);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[5]),
    					listen(button2, "click", /*click_handler_3*/ ctx[8]),
    					listen(button3, "click", /*click_handler_4*/ ctx[9]),
    					listen(button4, "click", /*click_handler_5*/ ctx[10]),
    					listen(button5, "click", /*click_handler_6*/ ctx[11]),
    					listen(button6, "click", /*click_handler_7*/ ctx[12]),
    					listen(button7, "click", /*click_handler_8*/ ctx[13]),
    					listen(button8, "click", /*click_handler_9*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button1, null);
    				}
    			}

    			if (dirty & /*$location*/ 4 && button3_class_value !== (button3_class_value = "lg:inline-flex flex lg:w-auto text-xl\n            " + (/*$location*/ ctx[2] === "/"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + " \n            px-2 py-1  text-gray-900 font-normal\n            hover:text-white hover:bg-gray-900 mr-2 roboto")) {
    				attr(button3, "class", button3_class_value);
    			}

    			if (dirty & /*$location*/ 4 && button4_class_value !== (button4_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/investment-plans-page"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + "\n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto")) {
    				attr(button4, "class", button4_class_value);
    			}

    			if (dirty & /*$location*/ 4 && button5_class_value !== (button5_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/portal/dashboard"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + "\n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto")) {
    				attr(button5, "class", button5_class_value);
    			}

    			if (dirty & /*$location*/ 4 && button6_class_value !== (button6_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/about"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + " \n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto")) {
    				attr(button6, "class", button6_class_value);
    			}

    			if (dirty & /*$location*/ 4 && button7_class_value !== (button7_class_value = "lg:inline-flex flex lg:w-auto text-lg font-normal mr-2\n            " + (/*$location*/ ctx[2] === "/contact"
    			? "border-b-4 border-yellow-700"
    			: "border-b-0") + " \n            px-2 py-1  text-gray-900 \n            hover:text-white hover:bg-gray-900 roboto")) {
    				attr(button7, "class", button7_class_value);
    			}

    			if (dirty & /*menu*/ 1 && div2_class_value !== (div2_class_value = "" + ((/*menu*/ ctx[0] === true ? "block" : "hidden") + " w-full lg:inline-flex lg:flex-row lg:w-auto"))) {
    				attr(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(section);
    			if_block.d();
    			if (detaching) detach(t4);
    			if (detaching) detach(nav);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $location;
    	component_subscribe($$self, location, $$value => $$invalidate(2, $location = $$value));
    	let menu = false;
    	let _auth;
    	const _authFound = JSON.parse(localStorage.getItem("User"));

    	if (_authFound) {
    		_auth = true;
    	} else {
    		_auth = false;
    	}

    	const logout = () => {
    		localStorage.removeItem("User");
    		localStorage.removeItem("token");
    		$$invalidate(1, _auth = false);
    		push("/");
    	};

    	const menuActive = () => {
    		$$invalidate(0, menu = !menu);
    	};

    	const click_handler = () => push("/auth/signin");
    	const click_handler_1 = () => push("/auth/signup");
    	const click_handler_2 = () => logout();
    	const click_handler_3 = () => menuActive();
    	const click_handler_4 = () => push("/");
    	const click_handler_5 = () => push("/investment-plans-page");
    	const click_handler_6 = () => push("/admin/dashboard");
    	const click_handler_7 = () => push("/about");
    	const click_handler_8 = () => push("/contact");
    	const click_handler_9 = () => push("/admin/dashboard");

    	return [
    		menu,
    		_auth,
    		$location,
    		logout,
    		menuActive,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	];
    }

    class Nav extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.31.0 */

    function create_fragment$2(ctx) {
    	let footer;

    	return {
    		c() {
    			footer = element("footer");
    			footer.innerHTML = `<div class="container mx-auto p-6"><h4 class="font-normal lg:text-lg text-base text-white">Copyright © 2020 Binterest</h4></div>`;
    			attr(footer, "class", "bg-gray-500");
    		},
    		m(target, anchor) {
    			insert(target, footer, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(footer);
    		}
    	};
    }

    class Footer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src\components\Jumbotron.svelte generated by Svelte v3.31.0 */

    function create_fragment$3(ctx) {
    	let t0;
    	let div4;
    	let main;
    	let div3;
    	let div0;
    	let t4;
    	let div1;
    	let p;
    	let t8;
    	let div2;
    	let a0;
    	let t10;
    	let a1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			t0 = space();
    			div4 = element("div");
    			main = element("main");
    			div3 = element("div");
    			div0 = element("div");

    			div0.innerHTML = `<h2 class="text-white font-thin font-semibold lg:text-5xl text-3xl">Take the World&#39;s best</h2> 
        <h2 style="" class="text-white font-thin font-semibold lg:text-5xl text-3xl">Crypto currency site</h2>`;

    			t4 = space();
    			div1 = element("div");
    			p = element("p");

    			p.textContent = `Join 15,000+ people who has ${"\n"} 
      opened an account with Binterest`;

    			t8 = space();
    			div2 = element("div");
    			a0 = element("a");
    			a0.textContent = "Read More";
    			t10 = space();
    			a1 = element("a");
    			a1.textContent = "Register Now";
    			attr(div0, "class", "my-8");
    			attr(p, "class", "text-lg font-thin mb-3 text-white");
    			attr(div1, "class", "my-8");
    			set_style(a0, "cursor", "pointer");
    			attr(a0, "class", "mr-3 px-4 text-lg py-3 shadow-md font-medium text-gray-700 bg-white rounded hover:bg-gray-700 hover:text-white transition duration-400 hover:shadow-xl");
    			set_style(a1, "cursor", "pointer");
    			attr(a1, "class", "px-4 text-lg py-3 shadow-md font-medium text-white bg-gray-700 rounded hover:bg-white hover:text-gray-700 transition duration-400 hover:shadow-xl");
    			attr(div2, "class", "mt-5");
    			attr(div3, "class", "h-auto lg:p-20 p-12 container mx-auto px-1");
    			attr(main, "class", "bg-scroll bg-no-repeat shadow bg-gradient-to-tr");
    			set_style(div4, "background-image", "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/carousel-images/img1.jpg)");
    			attr(div4, "class", "bg-gradient-to-b jumbotron-image p-5 svelte-1oyz7ft");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, div4, anchor);
    			append(div4, main);
    			append(main, div3);
    			append(div3, div0);
    			append(div3, t4);
    			append(div3, div1);
    			append(div1, p);
    			append(div3, t8);
    			append(div3, div2);
    			append(div2, a0);
    			append(div2, t10);
    			append(div2, a1);

    			if (!mounted) {
    				dispose = [
    					listen(a0, "click", /*click_handler*/ ctx[0]),
    					listen(a1, "click", /*click_handler_1*/ ctx[1])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self) {
    	const click_handler = () => push("/about");
    	const click_handler_1 = () => push("/auth/signup");
    	return [click_handler, click_handler_1];
    }

    class Jumbotron extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});
    	}
    }

    const _btcCash  = writable([
    {
    	coin: 'Bitcoin Cash',
    	price: '$100 - $900usd bitcoinCash',
    	time: '12 Hours',
    	type: 'Bronze investment plan',
    	profit: 'Profit and 30%'
    },
    {
    	coin: 'Bitcoin Cash',
    	price: '$1000 - $9000',
    	time: '24 Hours',
    	type: 'Platinum investment plan ',
    	profit: 'Profit rate at 50%'
    },
    {
    	coin: 'Bitcoin Cash',
    	price: '$10000 - $19000',
    	time: '12 Hours',
    	type: 'Diamond investment plan ',
    	profit: 'Profit rate at 70%'
    },
    {
    	coin: 'Bitcoin Cash',
    	price: '$20000 - $50000usd bitcoinCash',
    	time: '24 Hours',
    	type: 'Gold investment plan',
    	profit: 'Profit rate at 100000'
    }
    ]);

    const _btc  = writable([
    	{
    		coin: 'Bitcoin ',
    		price: '$100 - $900usd bitcoin',
    		time: '12 Hours',
    		type: 'Bronze investment plan',
    		profit: 'Profit and 30%'
    	},
    	{
    		coin: 'Bitcoin ',
    		price: '$1000 - $9000',
    		time: '24 Hours',
    		type: 'Platinum investment plan ',
    		profit: 'Profit rate at 50%'
    	},
    	{
    		coin: 'Bitcoin ',
    		price: '$10000 - $19000',
    		time: '12 Hours',
    		type: 'Diamond investment plan ',
    		profit: 'Profit rate at 70%'
    	},
    	{
    		coin: 'Bitcoin ',
    		price: '$20000 - $50000usd bitcoin',
    		time: '24 Hours',
    		type: 'Gold investment plan',
    		profit: 'Profit rate at 100000'
    	}
    ]);

    const _eth  = writable([
    	{
    		coin: 'Ethereum',
    		price: '$100 - $900usd eth',
    		time: '12 Hours',
    		type: 'Bronze investment plan',
    		profit: 'Profit and 30%'
    	},
    	{
    		coin: 'Ethereum',
    		price: '$1000 - $9000',
    		time: '24 Hours',
    		type: 'Platinum investment plan ',
    		profit: 'Profit rate at 50%'
    	},
    	{
    		coin: 'Ethereum',
    		price: '$10000 - $19000',
    		time: '12 Hours',
    		type: 'Diamond investment plan ',
    		profit: 'Profit rate at 70%'
    	},
    	{
    		coin: 'Ethereum',
    		price: '$20000 - $50000usd eth',
    		time: '24 Hours',
    		type: 'Gold investment plan',
    		profit: 'Profit rate at 100000'
    	}
    ]);

    const notification_body = writable({title: "", body: "", date: ""});

    /* src\pages\index.svelte generated by Svelte v3.31.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].coin;
    	child_ctx[8] = list[i].price;
    	child_ctx[9] = list[i].time;
    	child_ctx[10] = list[i].type;
    	child_ctx[11] = list[i].profit;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].coin;
    	child_ctx[8] = list[i].price;
    	child_ctx[9] = list[i].time;
    	child_ctx[10] = list[i].type;
    	child_ctx[11] = list[i].profit;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].coin;
    	child_ctx[8] = list[i].price;
    	child_ctx[9] = list[i].time;
    	child_ctx[10] = list[i].type;
    	child_ctx[11] = list[i].profit;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (148:6) {#each btc as {coin, price, time, type, profit}
    function create_each_block_2(ctx) {
    	let div1;
    	let div0;
    	let h30;
    	let t0_value = /*type*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3_value = /*coin*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let t5;
    	let h50;
    	let t6_value = /*price*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let h51;
    	let t8_value = /*profit*/ ctx[11] + "";
    	let t8;
    	let t9;
    	let h52;
    	let t10_value = /*time*/ ctx[9] + "";
    	let t10;
    	let t11;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*coin*/ ctx[7], /*price*/ ctx[8], /*type*/ ctx[10], /*profit*/ ctx[11]);
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			h50 = element("h5");
    			t6 = text(t6_value);
    			t7 = space();
    			h51 = element("h5");
    			t8 = text(t8_value);
    			t9 = space();
    			h52 = element("h5");
    			t10 = text(t10_value);
    			t11 = space();
    			button = element("button");
    			button.textContent = "INVEST NOW";
    			attr(h30, "class", "font-bold text-gray-900 lg:text-xl text-lg my-4 text-center");
    			attr(h31, "class", "font-bold text-gray-900 lg:text-lg text-lg my-2 text-center");
    			attr(h50, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h51, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h52, "class", "text-base font-normal text-gray-500 py-1");
    			attr(div0, "class", "px-3 py-2 h-auto border-2 border-gray-300 rounded");
    			set_style(button, "outline", "none");
    			attr(button, "class", "bg-gray-900 text-white w-full px-4 py-4");
    			attr(div1, "class", "my-2 lg:my-0 lg:mt-8 mt-12");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h30);
    			append(h30, t0);
    			append(div0, t1);
    			append(div0, h31);
    			append(h31, t2);
    			append(h31, t3);
    			append(h31, t4);
    			append(div0, t5);
    			append(div0, h50);
    			append(h50, t6);
    			append(div0, t7);
    			append(div0, h51);
    			append(h51, t8);
    			append(div0, t9);
    			append(div0, h52);
    			append(h52, t10);
    			append(div1, t11);
    			append(div1, button);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*btc*/ 1 && t0_value !== (t0_value = /*type*/ ctx[10] + "")) set_data(t0, t0_value);
    			if (dirty & /*btc*/ 1 && t3_value !== (t3_value = /*coin*/ ctx[7] + "")) set_data(t3, t3_value);
    			if (dirty & /*btc*/ 1 && t6_value !== (t6_value = /*price*/ ctx[8] + "")) set_data(t6, t6_value);
    			if (dirty & /*btc*/ 1 && t8_value !== (t8_value = /*profit*/ ctx[11] + "")) set_data(t8, t8_value);
    			if (dirty & /*btc*/ 1 && t10_value !== (t10_value = /*time*/ ctx[9] + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (165:6) {#each btcCash as {coin, price, time, type, profit}
    function create_each_block_1(ctx) {
    	let div1;
    	let div0;
    	let h30;
    	let t0_value = /*type*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3_value = /*coin*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let t5;
    	let h50;
    	let t6_value = /*price*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let h51;
    	let t8_value = /*profit*/ ctx[11] + "";
    	let t8;
    	let t9;
    	let h52;
    	let t10_value = /*time*/ ctx[9] + "";
    	let t10;
    	let t11;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			h50 = element("h5");
    			t6 = text(t6_value);
    			t7 = space();
    			h51 = element("h5");
    			t8 = text(t8_value);
    			t9 = space();
    			h52 = element("h5");
    			t10 = text(t10_value);
    			t11 = space();
    			button = element("button");
    			button.textContent = "INVEST NOW";
    			attr(h30, "class", "font-bold text-gray-900 lg:text-xl text-lg my-4 text-center");
    			attr(h31, "class", "font-bold text-gray-900 lg:text-lg text-lg my-2 text-center");
    			attr(h50, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h51, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h52, "class", "text-base font-normal text-gray-500 py-1");
    			attr(div0, "class", "px-3 py-2 h-auto border-2 border-gray-300 rounded");
    			set_style(button, "outline", "none");
    			attr(button, "class", "bg-gray-900 text-white w-full px-4 py-4");
    			attr(div1, "class", "my-2 lg:my-0 lg:mt-8 mt-12");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h30);
    			append(h30, t0);
    			append(div0, t1);
    			append(div0, h31);
    			append(h31, t2);
    			append(h31, t3);
    			append(h31, t4);
    			append(div0, t5);
    			append(div0, h50);
    			append(h50, t6);
    			append(div0, t7);
    			append(div0, h51);
    			append(h51, t8);
    			append(div0, t9);
    			append(div0, h52);
    			append(h52, t10);
    			append(div1, t11);
    			append(div1, button);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_1*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*btcCash*/ 2 && t0_value !== (t0_value = /*type*/ ctx[10] + "")) set_data(t0, t0_value);
    			if (dirty & /*btcCash*/ 2 && t3_value !== (t3_value = /*coin*/ ctx[7] + "")) set_data(t3, t3_value);
    			if (dirty & /*btcCash*/ 2 && t6_value !== (t6_value = /*price*/ ctx[8] + "")) set_data(t6, t6_value);
    			if (dirty & /*btcCash*/ 2 && t8_value !== (t8_value = /*profit*/ ctx[11] + "")) set_data(t8, t8_value);
    			if (dirty & /*btcCash*/ 2 && t10_value !== (t10_value = /*time*/ ctx[9] + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (184:6) {#each eth as {coin, price, time, type, profit}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let h30;
    	let t0_value = /*type*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3_value = /*coin*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let t5;
    	let h50;
    	let t6_value = /*price*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let h51;
    	let t8_value = /*profit*/ ctx[11] + "";
    	let t8;
    	let t9;
    	let h52;
    	let t10_value = /*time*/ ctx[9] + "";
    	let t10;
    	let t11;
    	let button;
    	let t13;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			h50 = element("h5");
    			t6 = text(t6_value);
    			t7 = space();
    			h51 = element("h5");
    			t8 = text(t8_value);
    			t9 = space();
    			h52 = element("h5");
    			t10 = text(t10_value);
    			t11 = space();
    			button = element("button");
    			button.textContent = "INVEST NOW";
    			t13 = space();
    			attr(h30, "class", "font-bold text-gray-900 lg:text-xl text-lg my-4 text-center");
    			attr(h31, "class", "font-bold text-gray-900 lg:text-lg text-lg my-2 text-center");
    			attr(h50, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h51, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h52, "class", "text-base font-normal text-gray-500 py-1");
    			attr(div0, "class", "px-3 py-2 h-auto border-2 border-gray-300 rounded");
    			set_style(button, "outline", "none");
    			attr(button, "class", "bg-gray-900 text-white w-full px-4 py-4");
    			attr(div1, "class", "my-2 lg:mt-8 mt-12 lg:my-0");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h30);
    			append(h30, t0);
    			append(div0, t1);
    			append(div0, h31);
    			append(h31, t2);
    			append(h31, t3);
    			append(h31, t4);
    			append(div0, t5);
    			append(div0, h50);
    			append(h50, t6);
    			append(div0, t7);
    			append(div0, h51);
    			append(h51, t8);
    			append(div0, t9);
    			append(div0, h52);
    			append(h52, t10);
    			append(div1, t11);
    			append(div1, button);
    			append(div1, t13);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_2*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*eth*/ 4 && t0_value !== (t0_value = /*type*/ ctx[10] + "")) set_data(t0, t0_value);
    			if (dirty & /*eth*/ 4 && t3_value !== (t3_value = /*coin*/ ctx[7] + "")) set_data(t3, t3_value);
    			if (dirty & /*eth*/ 4 && t6_value !== (t6_value = /*price*/ ctx[8] + "")) set_data(t6, t6_value);
    			if (dirty & /*eth*/ 4 && t8_value !== (t8_value = /*profit*/ ctx[11] + "")) set_data(t8, t8_value);
    			if (dirty & /*eth*/ 4 && t10_value !== (t10_value = /*time*/ ctx[9] + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let main;
    	let jumbotron;
    	let t0;
    	let div44;
    	let div43;
    	let div0;
    	let t2;
    	let hr0;
    	let t3;
    	let section0;
    	let div3;
    	let div2;
    	let div1;
    	let t4;
    	let h60;
    	let t6;
    	let span0;
    	let t9;
    	let span1;
    	let t11;
    	let div6;
    	let div5;
    	let div4;
    	let t12;
    	let h61;
    	let t14;
    	let span2;
    	let t17;
    	let span3;
    	let t19;
    	let div9;
    	let div8;
    	let div7;
    	let t20;
    	let h62;
    	let t22;
    	let span4;
    	let t25;
    	let span5;
    	let t27;
    	let div12;
    	let div11;
    	let div10;
    	let t28;
    	let h63;
    	let t30;
    	let span6;
    	let t33;
    	let span7;
    	let t35;
    	let section1;
    	let t42;
    	let section2;
    	let t49;
    	let section3;
    	let div19;
    	let t51;
    	let hr2;
    	let t52;
    	let p3;
    	let t54;
    	let div20;
    	let t55;
    	let t56;
    	let t57;
    	let a1;
    	let t59;
    	let section4;
    	let t97;
    	let section5;
    	let current;
    	jumbotron = new Jumbotron({});
    	let each_value_2 = /*btc*/ ctx[0];
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*btcCash*/ ctx[1];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*eth*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			main = element("main");
    			create_component(jumbotron.$$.fragment);
    			t0 = space();
    			div44 = element("div");
    			div43 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<center>LARGE INVESTMENT ORGANISATION</center>`;
    			t2 = space();
    			hr0 = element("hr");
    			t3 = space();
    			section0 = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<img src="assets/site-images/img1.png" style="height: 60px; width: 60px;"/>`;
    			t4 = space();
    			h60 = element("h6");
    			h60.textContent = "THE CLOCK";
    			t6 = space();
    			span0 = element("span");
    			span0.textContent = `23 hours a day, Sunday-Friday.${"\n"}`;
    			t9 = space();
    			span1 = element("span");
    			span1.textContent = "Whenever you want to trade.";
    			t11 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div4.innerHTML = `<img src="assets/site-images/img2.png" style="height: 60px; width: 60px;"/>`;
    			t12 = space();
    			h61 = element("h6");
    			h61.textContent = "NO HIDDEN FEES";
    			t14 = space();
    			span2 = element("span");
    			span2.textContent = `We have no hidden charges,${"\n"}`;
    			t17 = space();
    			span3 = element("span");
    			span3.textContent = "what you see is what you get.";
    			t19 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div7.innerHTML = `<img src="assets/site-images/img3.png" style="height: 60px; width: 60px;"/>`;
    			t20 = space();
    			h62 = element("h6");
    			h62.textContent = "INSTANT TRADING";
    			t22 = space();
    			span4 = element("span");
    			span4.textContent = `All Trades are instant once you${"\n"}`;
    			t25 = space();
    			span5 = element("span");
    			span5.textContent = "approve of them..";
    			t27 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div10.innerHTML = `<img src="assets/site-images/img4.png" style="height: 60px; width: 60px;"/>`;
    			t28 = space();
    			h63 = element("h6");
    			h63.textContent = "SECURE TRUSTED";
    			t30 = space();
    			span6 = element("span");
    			span6.textContent = `Our systems are secured with${"\n"}`;
    			t33 = space();
    			span7 = element("span");
    			span7.textContent = "256bits encryption.";
    			t35 = space();
    			section1 = element("section");

    			section1.innerHTML = `<div class="px-4 mb-5 lg:px-0"><div class="lg:text-4xl text-lg font-bold roboto text-gray-900 p-4"><center>Crypto Currency Is The Largest Market In The World</center></div> 
							<hr class="my-5 bg-gray-300 px-4 mx-4 lg:mx-24"/> 
						<span class="mb-10 mx-2"><p class="text-base font-normal svelte-252o0p">Cryptocurrencies which are designed to be used for peer-to-peer transactions without being liable to any government or central bank are the latest financial innovations explored not only for the reasons of their being but also for potential risks and oppurtunities in the financial industry.</p> 
							<p class="text-base font-normal pt-5 svelte-252o0p">There are thousands of cryptocurrencies with various design goals. These design goals are to provide a digital currency alternative to cash (Bitcoin, Monero and Bitcoin cash), to support payment system at low-cost ( Ripple, Particl and Utility Settlement Coin),to support peer-to-peer trading activity by creating tokens ( RMG and Maecanas), to facilitate secure access to a good or service in peer-to-peer trading (Golem, Filecoin) and to support underlying platform or protocol ( Ether and NEO). These design goals mentioned won&#39;t be exhaustive as new cryptocurrencies are being created every week. Blockchain is the underlying technology for most of the cryptocurrencies.</p></span></div>`;

    			t42 = space();
    			section2 = element("section");

    			section2.innerHTML = `<div class="px-4 mb-5 lg:px-0"><div class="lg:grid block lg:grid-cols-2 lg:gap-5"><div class="p-1 mb-6"><img src="assets/site-images/img5.jpg" class="rounded random-img svelte-252o0p"/></div> 
							<div><h2 class="p-3 text-gray-900 roboto font-semibold lg:font-semibold lg:text-3xl text-base mb-8">Trading involves risk. It wouldn’t be exciting if it didn’t.</h2> 
									<p class="mb-10 mx-2 text-base font-normal svelte-252o0p">That’s why we offer a revolutionary approach to trading for the active short-term trader with Etoro Binary Options. Etoro Binary Options are financial instruments that turns every trade into a simple question: will this market be above this price at this time.</p> 
									
									<a href="#" class="px-5 py-4 text-lg roboto text-white bg-gray-900 mt-8 mx-2 rounded">Read More</a></div></div></div>`;

    			t49 = space();
    			section3 = element("section");
    			div19 = element("div");
    			div19.innerHTML = `<center>Our Plans</center>`;
    			t51 = space();
    			hr2 = element("hr");
    			t52 = space();
    			p3 = element("p");
    			p3.textContent = "Choose your perfect plan and make your own strategy to get profits daily and hourly. You are allowed to make 3 investments per day with different currency's. If you invest more\n\t\t\t\t\t\t\tthan 3 investments per day your investment will be refused and refunded.";
    			t54 = space();
    			div20 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t55 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t56 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t57 = space();
    			a1 = element("a");
    			a1.textContent = "More Plans >>";
    			t59 = space();
    			section4 = element("section");

    			section4.innerHTML = `<div class="lg:text-4xl text-lg roboto font-bold text-gray-900 p-4"><center>Why Choose Us</center></div> 
						<hr class="my-7 bg-gray-300 px-4 mx-4 lg:mx-24"/> 
					<span class="text-gray-400 text-base"><center>We are the most dynamic in the market space.</center></span> 
					<div class="mb-5 lg:px-0 mt-5 lg:grid grid-cols-3"><div class="flex flex-col px-2"><div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center svelte-252o0p"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Payment Options</h4> 
								<p class="svelte-252o0p">We accept all major cryptocurrency payment options known to you.</p></div> 

							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center svelte-252o0p"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Legal Compliance</h4> 
								<p class="svelte-252o0p">We abide by financial regulations of the industry, be rest assured you are safe and money secured.</p></div> 

							<div style="padding: 0px 30px;" class="text-center"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Cross-Platform Trading</h4> 
								<p class="svelte-252o0p">We support cross-platform trading, multi-currency options also applicable.</p></div></div> 

						<div class="flex flex-col px-2"><div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center svelte-252o0p"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Strong Security</h4> 
								<p class="svelte-252o0p">We have one of the best secured trading network worldwide as we have our servers secured offsite.</p></div> 

							<div style="padding: 0px 30px 70px;"><img src="assets/site-images/img6.png" style="height: 300px; width: 600px;"/></div> 

							<div style="padding: 0px 30px;" class="fle flex-row text-center"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Competitive Commissions</h4> 
								<p class="svelte-252o0p">We pay comissions better than your next best choice.</p></div></div> 

						<div class="flex flex-col px-2"><div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center svelte-252o0p"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">World Coverage</h4> 
								<p class="svelte-252o0p">Cryptocurrency is a general language and so is our coverage, worldwide, we speak your language</p></div> 

							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center svelte-252o0p"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Advanced Reporting</h4> 
								<p class="svelte-252o0p">Detailed reporting daily, weekly and monthly. We give you infographic reports.</p></div> 

							<div style="padding: 0px 30px;" class="text-center"><h4 class="why-choose-us svelte-252o0p" style="padding: 0px 0px 12px;">Margin Trading</h4> 
								<p class="svelte-252o0p">Trading that puts your mind at ease.</p></div></div></div>`;

    			t97 = space();
    			section5 = element("section");

    			section5.innerHTML = `<div class="lg:text-4xl text-lg roboto font-bold text-gray-900 p-4"><center>HOW IT WORKS</center></div> 
						<hr class="my-4 bg-gray-300 px-4 mx-4 lg:mx-56"/> 
					<span class="text-gray-400 text-base"><center>Very easy to get started</center></span> 

					<div class="lg:grid px-3 py-3 grid-cols-3 gap-5"><div class="lg:p-5 flex flex-col text-center p-8"><div class="flex flex-row justify-center  pb-4"><img src="assets/site-images/red1.png" style="height: 60px; width: 60px;"/></div> 

							<h6 style="font-size: 24px;" class="text-gray-700 mb-1 font-medium">Sign up with us</h6> 
							<p class="text-base font-normal svelte-252o0p">Registration is easy and straight forward</p></div> 

						<div class="lg:p-5 flex flex-col text-center p-8"><div class="flex flex-row justify-center  pb-4"><img src="assets/site-images/red2.png" style="height: 60px; width: 60px;"/></div> 

							<h6 style="font-size: 24px;" class="text-gray-700 mb-1 font-medium">Create Wallet</h6> 
							<p class="text-base font-normal svelte-252o0p">Create your wallet</p></div> 

						<div class="lg:p-5 flex flex-col text-center p-8"><div class="flex flex-row justify-center  pb-4"><img src="assets/site-images/red3.png" style="height: 60px; width: 60px;"/></div> 

							<h6 style="font-size: 24px;" class="text-gray-700 mb-1 font-medium">Invest with us</h6> 
							<p class="text-base font-normal svelte-252o0p">Choose a prefer plan and invest</p></div></div>`;

    			attr(div0, "class", "lg:text-3xl text-lg font-bold text-gray-900 p-4");
    			attr(hr0, "class", "my-2 bg-gray-300 px-4 mx-4 lg:mx-20");
    			attr(div1, "class", "flex flex-row justify-center  pb-4");
    			set_style(h60, "font-size", "16px");
    			attr(h60, "class", "text-gray-700 mb-1 font-medium");
    			attr(span0, "class", "text-base text-gray-400");
    			attr(span1, "class", "text-base text-gray-400");
    			set_style(div2, "background-color", "#FFF1E0");
    			attr(div2, "class", "lg:p-5 flex flex-col text-center p-8");
    			attr(div3, "class", "px-4 mb-5 lg:px-0");
    			attr(div4, "class", "flex flex-row justify-center pb-4");
    			set_style(h61, "font-size", "16px");
    			attr(h61, "class", "text-gray-700 mb-1 font-medium");
    			attr(span2, "class", "text-base text-gray-400");
    			attr(span3, "class", "text-base text-gray-400");
    			set_style(div5, "background-color", "#FFF1E0");
    			attr(div5, "class", "lg:p-5 bg-yellow-200 flex flex-col text-center p-8");
    			attr(div6, "class", "px-4 mb-5 lg:px-0");
    			attr(div7, "class", "flex flex-row justify-center  pb-4");
    			set_style(h62, "font-size", "16px");
    			attr(h62, "class", "text-gray-700 mb-1 font-medium");
    			attr(span4, "class", "text-base text-gray-400");
    			attr(span5, "class", "text-base text-gray-400");
    			set_style(div8, "background-color", "#FFF1E0");
    			attr(div8, "class", "lg:p-5 bg-yellow-200 flex flex-col text-center p-8");
    			attr(div9, "class", "px-4 mb-5 lg:px-0");
    			attr(div10, "class", "flex flex-row justify-center  pb-4");
    			set_style(h63, "font-size", "16px");
    			attr(h63, "class", "text-gray-700 mb-1 font-medium");
    			attr(span6, "class", "text-base text-gray-400");
    			attr(span7, "class", "text-base text-gray-400");
    			set_style(div11, "background-color", "#FFF1E0");
    			attr(div11, "class", "lg:p-5 bg-yellow-200 flex flex-col text-center p-8");
    			attr(div12, "class", "px-4 mb-5 lg:px-0");
    			attr(section0, "class", "mt-12 lg:grid block grid-cols-4 gap-4");
    			attr(section1, "class", "mt-12");
    			attr(section2, "class", "mt-12");
    			attr(div19, "class", "lg:text-3xl text-lg font-bold text-gray-900 p-4");
    			attr(hr2, "class", "my-2 bg-gray-300 px-4 mx-12 lg:mx-56");
    			attr(p3, "class", "text-base font-normal pt-5 lg:mx-20 mx-8 svelte-252o0p");
    			set_style(p3, "font-size", "17px");
    			attr(div20, "class", "mt-8 px-4 lg:grid grid-cols-4 gap-4 grid-rows-3 mb-8");
    			attr(a1, "href", "#");
    			attr(a1, "class", "roboto text-white my-2 mx-4 py-3 text-white text-xl bg-gray-900 rounded px-2");
    			attr(section3, "class", "mt-12");
    			attr(section4, "class", "mt-12");
    			attr(section5, "class", "mt-12");
    			attr(div43, "class", "container mx-auto mt-4");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(jumbotron, main, null);
    			append(main, t0);
    			append(main, div44);
    			append(div44, div43);
    			append(div43, div0);
    			append(div43, t2);
    			append(div43, hr0);
    			append(div43, t3);
    			append(div43, section0);
    			append(section0, div3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div2, t4);
    			append(div2, h60);
    			append(div2, t6);
    			append(div2, span0);
    			append(div2, t9);
    			append(div2, span1);
    			append(section0, t11);
    			append(section0, div6);
    			append(div6, div5);
    			append(div5, div4);
    			append(div5, t12);
    			append(div5, h61);
    			append(div5, t14);
    			append(div5, span2);
    			append(div5, t17);
    			append(div5, span3);
    			append(section0, t19);
    			append(section0, div9);
    			append(div9, div8);
    			append(div8, div7);
    			append(div8, t20);
    			append(div8, h62);
    			append(div8, t22);
    			append(div8, span4);
    			append(div8, t25);
    			append(div8, span5);
    			append(section0, t27);
    			append(section0, div12);
    			append(div12, div11);
    			append(div11, div10);
    			append(div11, t28);
    			append(div11, h63);
    			append(div11, t30);
    			append(div11, span6);
    			append(div11, t33);
    			append(div11, span7);
    			append(div43, t35);
    			append(div43, section1);
    			append(div43, t42);
    			append(div43, section2);
    			append(div43, t49);
    			append(div43, section3);
    			append(section3, div19);
    			append(section3, t51);
    			append(section3, hr2);
    			append(section3, t52);
    			append(section3, p3);
    			append(section3, t54);
    			append(section3, div20);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div20, null);
    			}

    			append(div20, t55);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div20, null);
    			}

    			append(div20, t56);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div20, null);
    			}

    			append(section3, t57);
    			append(section3, a1);
    			append(div43, t59);
    			append(div43, section4);
    			append(div43, t97);
    			append(div43, section5);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*invest, btc*/ 9) {
    				each_value_2 = /*btc*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div20, t55);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*alert, btcCash*/ 2) {
    				each_value_1 = /*btcCash*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div20, t56);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*alert, eth*/ 4) {
    				each_value = /*eth*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div20, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(jumbotron.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(jumbotron.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(jumbotron);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let btc;
    	let btcCash;
    	let eth;

    	_btc.subscribe(v => {
    		$$invalidate(0, btc = v);
    	});

    	_btcCash.subscribe(v => {
    		$$invalidate(1, btcCash = v);
    	});

    	_eth.subscribe(v => {
    		$$invalidate(2, eth = v);
    	});

    	const invest = function (options) {
    		const User = localStorage.getItem("User");

    		if (!User) {
    			alert("You need to login to make an investment");
    			push("/auth/signin");
    		} else {
    			const { id, name, email } = JSON.parse(localStorage.getItem("User"));
    			const { coin, price, type, profit } = options;

    			const investmentData = {
    				id,
    				name,
    				coin,
    				price,
    				profit,
    				email,
    				type
    			};

    			localStorage.setItem("investmentData", JSON.stringify(investmentData));
    			push("/investment/confirm");
    		}
    	};

    	const click_handler = (coin, price, type, profit) => invest({ coin, price, type, profit });
    	const click_handler_1 = () => alert("This investment is not currently available");
    	const click_handler_2 = () => alert("This investment is not currently available");
    	return [btc, btcCash, eth, invest, click_handler, click_handler_1, click_handler_2];
    }

    class Pages extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});
    	}
    }

    /* src\pages\about.svelte generated by Svelte v3.31.0 */

    function create_fragment$5(ctx) {
    	let t0;
    	let main;

    	return {
    		c() {
    			t0 = space();
    			main = element("main");

    			main.innerHTML = `<section style="background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/site-images/img5.jpg);" class="bg-gradient-to-b jumbotron-image p-5 svelte-7wes96"><div class="bg-scroll bg-no-repeat shadow bg-gradient-to-tr"><div style="height: 316px;" class="p-12 container mx-auto px-1"><div class="mb-5 p-8 text-center"><h2 style="font-size: 40px;" class="roboto text-gray-200 font-thin">About Us</h2></div></div></div></section> 

	<div class="container mt-8 mx-auto px-5 mb-5"><section class="lg:grid grid-cols-2 gap-5"><div class=""><h2 class="about-txt font-medium text-gray-900 my-5 svelte-7wes96">About Bin<span class="about-txt font-medium text-gray-700 svelte-7wes96">Terest</span></h2> 

				<p class="font-normal text-gray-600 svelte-7wes96">Etoro is a trading company focused on customer satisfaction both online and offline to ensure you make trades with the least margin for error.</p> 

				<ul class="mt-5 svelte-7wes96"><li class="font-normal text-gray-600 inline-flex svelte-7wes96"><i class="material-icons mr-4 text-gray-900">check_circle_outline</i> 
					you can exchange your bitcoin by eth.</li> 

					<li class="font-normal text-gray-600 inline-flex svelte-7wes96"><i class="material-icons mr-4 text-gray-900">check_circle_outline</i>
						best profite bitco.exge for all over the world.</li> 

					<li class="font-normal text-gray-600 inline-flex svelte-7wes96"><i class="material-icons mr-4 text-gray-900">check_circle_outline</i>
						we take a big missoin for growth business.</li> 

					<li class="font-normal text-gray-600 inline-flex svelte-7wes96"><i class="material-icons mr-4 text-gray-900">check_circle_outline</i>
						we have top lavel bitcoin experts</li></ul> 

				<button class="px-5 py-4 text-lg roboto text-white bg-gray-900 mt-8 mx-2 rounded" style="outline: none;">Start Trading</button></div> 

			<div class="p-1 my-8"><img src="/assets/carousel-images/c-img3.jpeg" class="rounded random-img svelte-7wes96"/></div></section></div> 

	<section class="mb-5 mt-5 bg-gray-700"><div class="p-5 text-center"><h3 class="my-4 text-white text-3xl font-semibold">How work in Numbers</h3> 
					<p class="mb-4 font-normal text-base container lg:px-5 mx-auto text-white svelte-7wes96" style="font-size: 17px;">Etoro is a fully automated Investment platform operating with no human intervention, aside from regular server maintenance conducted by our staff
						Take full advantage of our fast and legit Investment platform. Our automated system gathers information from the blockchain transfers and cryptocurrency exchanges to study and predict the Bitcoin price</p></div></section> 

		<section class="my-7"><div class="lg:grid grid-cols-6 gap-4 py-4 px-5 container mx-auto"><img src="assets/comp-images/img1.png"/> 
				<img src="assets/comp-images/img2.png"/> 
				<img src="assets/comp-images/img3.png"/> 
				<img src="assets/comp-images/img4.png"/> 
				<img src="assets/comp-images/img5.png"/> 
				<img src="assets/comp-images/img6.png"/></div></section>`;

    			document.title = "About | Etoro";
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(main);
    		}
    	};
    }

    class About extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src\pages\contact.svelte generated by Svelte v3.31.0 */

    function create_if_block$2(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*msg*/ ctx[1]);
    			attr(span, "class", "bg-green-500 border-4 border-green-400 text-white text-center p-2");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*msg*/ 2) set_data(t, /*msg*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let main;
    	let div5;
    	let div4;
    	let div0;
    	let t1;
    	let div3;
    	let t2;
    	let form;
    	let div1;
    	let label0;
    	let t4;
    	let input0;
    	let t5;
    	let div2;
    	let label1;
    	let t7;
    	let input1;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = /*msg*/ ctx[1] !== "" && create_if_block$2(ctx);

    	return {
    		c() {
    			t0 = space();
    			main = element("main");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div3 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Text";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			document.title = "Contact | Binterest";
    			set_style(label0, "font-size", "20px");
    			attr(label0, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input0, "placeholder", "Enter Email");
    			attr(input0, "type", "email");
    			attr(input0, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div1, "class", "my-3 text-left");
    			set_style(label1, "font-size", "20px");
    			attr(label1, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input1, "placeholder", "Enter Text");
    			attr(input1, "type", "text");
    			attr(input1, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div2, "class", "my-3 text-left");
    			attr(button, "class", "bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200");
    			attr(button, "type", "submit");
    			attr(form, "class", "flex flex-col");
    			attr(div3, "class", "flex flex-col px-2 lg:mx-0 mx-4");
    			attr(div4, "class", "flex flex-row");
    			attr(div5, "class", "flex flex-col text-center justify-center");
    			set_style(div5, "align-items", "center");
    			set_style(div5, "min-height", "50vh");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    			append(main, div5);
    			append(div5, div4);
    			append(div4, div0);
    			append(div4, t1);
    			append(div4, div3);
    			if (if_block) if_block.m(div3, null);
    			append(div3, t2);
    			append(div3, form);
    			append(form, div1);
    			append(div1, label0);
    			append(div1, t4);
    			append(div1, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append(form, t5);
    			append(form, div2);
    			append(div2, label1);
    			append(div2, t7);
    			append(div2, input1);
    			set_input_value(input1, /*text*/ ctx[2]);
    			append(form, t8);
    			append(form, button);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen(button, "click", /*click_handler*/ ctx[6]),
    					listen(form, "submit", prevent_default(/*submit_handler*/ ctx[7]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*msg*/ ctx[1] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div3, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*text*/ 4 && input1.value !== /*text*/ ctx[2]) {
    				set_input_value(input1, /*text*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let email;
    	let msg = "";
    	let text;

    	const submit = function () {
    		$$invalidate(1, msg = "Thank You For Contacting Us We Will Give You Feed Back Soon");
    		$$invalidate(0, email = "");
    		$$invalidate(2, text = "");

    		setTimeout(
    			() => {
    				$$invalidate(1, msg = "");
    			},
    			5000
    		);
    	};

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		text = this.value;
    		$$invalidate(2, text);
    	}

    	const click_handler = () => submit();
    	const submit_handler = () => submit();

    	return [
    		email,
    		msg,
    		text,
    		submit,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		submit_handler
    	];
    }

    class Contact extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, {});
    	}
    }

    /* src\pages\pricingPage.svelte generated by Svelte v3.31.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].coin;
    	child_ctx[8] = list[i].price;
    	child_ctx[9] = list[i].time;
    	child_ctx[10] = list[i].type;
    	child_ctx[11] = list[i].profit;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].coin;
    	child_ctx[8] = list[i].price;
    	child_ctx[9] = list[i].time;
    	child_ctx[10] = list[i].type;
    	child_ctx[11] = list[i].profit;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].coin;
    	child_ctx[8] = list[i].price;
    	child_ctx[9] = list[i].time;
    	child_ctx[10] = list[i].type;
    	child_ctx[11] = list[i].profit;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (155:7) {#each btc as {coin, price, time, type, profit}
    function create_each_block_2$1(ctx) {
    	let div1;
    	let div0;
    	let h30;
    	let t0_value = /*type*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3_value = /*coin*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let t5;
    	let h50;
    	let t6_value = /*price*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let h51;
    	let t8_value = /*profit*/ ctx[11] + "";
    	let t8;
    	let t9;
    	let h52;
    	let t10_value = /*time*/ ctx[9] + "";
    	let t10;
    	let t11;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*coin*/ ctx[7], /*price*/ ctx[8], /*type*/ ctx[10], /*profit*/ ctx[11]);
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			h50 = element("h5");
    			t6 = text(t6_value);
    			t7 = space();
    			h51 = element("h5");
    			t8 = text(t8_value);
    			t9 = space();
    			h52 = element("h5");
    			t10 = text(t10_value);
    			t11 = space();
    			button = element("button");
    			button.textContent = "INVEST NOW";
    			attr(h30, "class", "font-bold text-gray-900 lg:text-xl text-lg my-4 text-center");
    			attr(h31, "class", "font-bold text-gray-900 lg:text-lg text-lg my-2 text-center");
    			attr(h50, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h51, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h52, "class", "text-base font-normal text-gray-500 py-1");
    			attr(div0, "class", "px-3 py-2 h-auto border-2 border-gray-300 rounded");
    			set_style(button, "outline", "none");
    			attr(button, "class", "bg-gray-900 text-white w-full px-4 py-4");
    			attr(div1, "class", "my-2 lg:my-0 lg:mt-8 mt-12");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h30);
    			append(h30, t0);
    			append(div0, t1);
    			append(div0, h31);
    			append(h31, t2);
    			append(h31, t3);
    			append(h31, t4);
    			append(div0, t5);
    			append(div0, h50);
    			append(h50, t6);
    			append(div0, t7);
    			append(div0, h51);
    			append(h51, t8);
    			append(div0, t9);
    			append(div0, h52);
    			append(h52, t10);
    			append(div1, t11);
    			append(div1, button);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*btc*/ 1 && t0_value !== (t0_value = /*type*/ ctx[10] + "")) set_data(t0, t0_value);
    			if (dirty & /*btc*/ 1 && t3_value !== (t3_value = /*coin*/ ctx[7] + "")) set_data(t3, t3_value);
    			if (dirty & /*btc*/ 1 && t6_value !== (t6_value = /*price*/ ctx[8] + "")) set_data(t6, t6_value);
    			if (dirty & /*btc*/ 1 && t8_value !== (t8_value = /*profit*/ ctx[11] + "")) set_data(t8, t8_value);
    			if (dirty & /*btc*/ 1 && t10_value !== (t10_value = /*time*/ ctx[9] + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (172:7) {#each btcCash as {coin, price, time, type, profit}
    function create_each_block_1$1(ctx) {
    	let div1;
    	let div0;
    	let h30;
    	let t0_value = /*type*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3_value = /*coin*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let t5;
    	let h50;
    	let t6_value = /*price*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let h51;
    	let t8_value = /*profit*/ ctx[11] + "";
    	let t8;
    	let t9;
    	let h52;
    	let t10_value = /*time*/ ctx[9] + "";
    	let t10;
    	let t11;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			h50 = element("h5");
    			t6 = text(t6_value);
    			t7 = space();
    			h51 = element("h5");
    			t8 = text(t8_value);
    			t9 = space();
    			h52 = element("h5");
    			t10 = text(t10_value);
    			t11 = space();
    			button = element("button");
    			button.textContent = "INVEST NOW";
    			attr(h30, "class", "font-bold text-gray-900 lg:text-xl text-lg my-4 text-center");
    			attr(h31, "class", "font-bold text-gray-900 lg:text-lg text-lg my-2 text-center");
    			attr(h50, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h51, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h52, "class", "text-base font-normal text-gray-500 py-1");
    			attr(div0, "class", "px-3 py-2 h-auto border-2 border-gray-300 rounded");
    			set_style(button, "outline", "none");
    			attr(button, "class", "bg-gray-900 text-white w-full px-4 py-4");
    			attr(div1, "class", "my-2 lg:my-0 lg:mt-8 mt-12");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h30);
    			append(h30, t0);
    			append(div0, t1);
    			append(div0, h31);
    			append(h31, t2);
    			append(h31, t3);
    			append(h31, t4);
    			append(div0, t5);
    			append(div0, h50);
    			append(h50, t6);
    			append(div0, t7);
    			append(div0, h51);
    			append(h51, t8);
    			append(div0, t9);
    			append(div0, h52);
    			append(h52, t10);
    			append(div1, t11);
    			append(div1, button);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_1*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*btcCash*/ 2 && t0_value !== (t0_value = /*type*/ ctx[10] + "")) set_data(t0, t0_value);
    			if (dirty & /*btcCash*/ 2 && t3_value !== (t3_value = /*coin*/ ctx[7] + "")) set_data(t3, t3_value);
    			if (dirty & /*btcCash*/ 2 && t6_value !== (t6_value = /*price*/ ctx[8] + "")) set_data(t6, t6_value);
    			if (dirty & /*btcCash*/ 2 && t8_value !== (t8_value = /*profit*/ ctx[11] + "")) set_data(t8, t8_value);
    			if (dirty & /*btcCash*/ 2 && t10_value !== (t10_value = /*time*/ ctx[9] + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (191:7) {#each eth as {coin, price, time, type, profit}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let h30;
    	let t0_value = /*type*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3_value = /*coin*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let t5;
    	let h50;
    	let t6_value = /*price*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let h51;
    	let t8_value = /*profit*/ ctx[11] + "";
    	let t8;
    	let t9;
    	let h52;
    	let t10_value = /*time*/ ctx[9] + "";
    	let t10;
    	let t11;
    	let button;
    	let t13;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			h50 = element("h5");
    			t6 = text(t6_value);
    			t7 = space();
    			h51 = element("h5");
    			t8 = text(t8_value);
    			t9 = space();
    			h52 = element("h5");
    			t10 = text(t10_value);
    			t11 = space();
    			button = element("button");
    			button.textContent = "INVEST NOW";
    			t13 = space();
    			attr(h30, "class", "font-bold text-gray-900 lg:text-xl text-lg my-4 text-center");
    			attr(h31, "class", "font-bold text-gray-900 lg:text-lg text-lg my-2 text-center");
    			attr(h50, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h51, "class", "text-base font-normal text-gray-500 py-1");
    			attr(h52, "class", "text-base font-normal text-gray-500 py-1");
    			attr(div0, "class", "px-3 py-2 h-auto border-2 border-gray-300 rounded");
    			set_style(button, "outline", "none");
    			attr(button, "class", "bg-gray-900 text-white w-full px-4 py-4");
    			attr(div1, "class", "my-2 lg:mt-8 mt-12 lg:my-0");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h30);
    			append(h30, t0);
    			append(div0, t1);
    			append(div0, h31);
    			append(h31, t2);
    			append(h31, t3);
    			append(h31, t4);
    			append(div0, t5);
    			append(div0, h50);
    			append(h50, t6);
    			append(div0, t7);
    			append(div0, h51);
    			append(h51, t8);
    			append(div0, t9);
    			append(div0, h52);
    			append(h52, t10);
    			append(div1, t11);
    			append(div1, button);
    			append(div1, t13);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_2*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*eth*/ 4 && t0_value !== (t0_value = /*type*/ ctx[10] + "")) set_data(t0, t0_value);
    			if (dirty & /*eth*/ 4 && t3_value !== (t3_value = /*coin*/ ctx[7] + "")) set_data(t3, t3_value);
    			if (dirty & /*eth*/ 4 && t6_value !== (t6_value = /*price*/ ctx[8] + "")) set_data(t6, t6_value);
    			if (dirty & /*eth*/ 4 && t8_value !== (t8_value = /*profit*/ ctx[11] + "")) set_data(t8, t8_value);
    			if (dirty & /*eth*/ 4 && t10_value !== (t10_value = /*time*/ ctx[9] + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let main;
    	let section0;
    	let t2;
    	let div5;
    	let t8;
    	let section2;
    	let t23;
    	let section3;
    	let div13;
    	let t25;
    	let hr0;
    	let t26;
    	let p4;
    	let t39;
    	let div14;
    	let t41;
    	let hr1;
    	let t42;
    	let p5;
    	let t44;
    	let div15;
    	let t45;
    	let t46;
    	let each_value_2 = /*btc*/ ctx[0];
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*btcCash*/ ctx[1];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*eth*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			t0 = space();
    			main = element("main");
    			section0 = element("section");
    			section0.innerHTML = `<div class="bg-scroll bg-no-repeat shadow bg-gradient-to-tr"><div style="height: 316px;" class="p-12 container mx-auto px-1"><div class="mb-5 p-8 text-center"><h2 style="font-size: 40px;" class="roboto text-gray-200 font-thin">Investment Plans</h2></div></div></div>`;
    			t2 = space();
    			div5 = element("div");

    			div5.innerHTML = `<section class="lg:grid grid-cols-2 gap-5"><div class=""><h2 class="about-txt font-medium text-gray-900 my-5 svelte-147ahzi">Large Investment Organisation</h2> 

				<p class="font-normal text-gray-600 svelte-147ahzi" style="font-size: 17px;">Binterest and bitcoin mining is a life changing investment platform where you can invest a certain amount of commodity (bitcoin) and get profits on a weekly basis and daily basis.
					<br/>
					
					Binterest deals with mining of assets in Crypto Currency, Crypto Currencies like Bitcoin, Etherium etc.
					We have employed the expertise of some good objective financial advisor and also Mining technology. So, you have to start up and join the success story.
					<br/></p></div> 

			<div class="p-1 my-8"><img src="/assets/carousel-images/c-img4.png" class="rounded random-img"/></div></section>`;

    			t8 = space();
    			section2 = element("section");

    			section2.innerHTML = `<div class="lg:grid grid-cols-3 gap-6 py-4 px-5 container mx-auto"><div class="flex flex-row"><img src="assets/comp-images/img7.png" style="height: 64px; width: 64px;"/> 
					<div class="flex flex-col ml-3"><h4 class="font-medium text-lg">Invest Bitcoin using USD</h4> 
						<p class="text-gray-500 p-015 svelte-147ahzi">Invest with us with 3 easy steps</p></div></div> 

				<div class="flex flex-row lg:mt-0 mt-4"><img src="assets/comp-images/img8.png" style="height: 64px; width: 64px;"/> 
					<div class="flex flex-col ml-3"><h4 class="font-medium text-lg">Deposit to our wallet</h4> 
						<p class="text-gray-500 p-015 svelte-147ahzi">Deposit and instantly get verified</p></div></div> 

				<div class="flex flex-row lg:mt-0 mt-4"><img src="assets/comp-images/img9.png" style="height: 64px; width: 64px;"/> 
					<div class="flex flex-col ml-3"><h4 class="font-medium text-lg">Invest Bitcoin using USD</h4> 
						<p class="text-gray-500 p-015 svelte-147ahzi">Invest with us with 3 easy steps</p></div></div></div>`;

    			t23 = space();
    			section3 = element("section");
    			div13 = element("div");
    			div13.innerHTML = `<center>About Our Plans</center>`;
    			t25 = space();
    			hr0 = element("hr");
    			t26 = space();
    			p4 = element("p");

    			p4.innerHTML = `Well Binterest is an investment that will earn you a consistent profit on a daily basis or weekly basis, Bitcoin mining refers to the process of hashing or using computers to solve complex algorithms. When an algorithm is solved a new Blockchain transaction is created and add bitcoin to the Blockchain or Bitcoin wallet , a 
							Blockchain or bitcoin wallet is a public platform where bitcoin, ethereum transaction are carried out..<br/> 
							<br/>
							As soon as your investment is confirmed in the miner system, automatically your mining will start. You will notice fractions of bitcoins mining in your wallet every 10minutes through out the duration of your investment plan

							You make investment of a certain amount of capital, then you get a certain percentage which the percentage isn’t fixed and it directly depends on how long you are investing...
							On average;
							The daily profit is over 85%
							The weekly profit is over 600%
							<br/><br/>
							For instance you make investment of \$1000, in a week you’ll get on average 560% For instance if the investment amount is \$1,000 and the daily expectancy is 85% = \$850
							If the period of your Mining is 10days
							You make 85% daily for 10days(\$850*10=\$8500­)
							For 20days you make (\$850 X 20= \$17,000)
							Monthly Mining (30days) you make on average (\$850 X 30=\$25,500)
							<br/><br/>
							The company get off just 20% off the profit made after every Mining Duration.
							<br/><br/>
							With minimum investment of;<br/>
							\$500 Binterest can help you make over \$3,000 in just 10 Mining days<br/>
							\$800 can help you make over \$4,800<br/>
							\$1,000 can make over \$5,000<br/>
							\$1,500 can make over \$6,250<br/>
							\$2,000 can Make over \$10,000<br/>
							\$5,000 can help you make over \$13,500 in 8days.`;

    			t39 = space();
    			div14 = element("div");
    			div14.innerHTML = `<center>Our Plans</center>`;
    			t41 = space();
    			hr1 = element("hr");
    			t42 = space();
    			p5 = element("p");
    			p5.textContent = "Choose your perfect plan and make your own strategy to get profits daily and hourly. You are allowed to make 3 investments per day with different currency's. If you invest more\n\t\t\t\t\t\t\t\tthan 3 investments per day your investment will be refused and refunded.";
    			t44 = space();
    			div15 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t45 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t46 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			document.title = "Pricing | Binterest";
    			set_style(section0, "background-image", "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/site-images/img5.jpg)");
    			attr(section0, "class", "bg-gradient-to-b jumbotron-image p-5 svelte-147ahzi");
    			attr(div5, "class", "container mt-8 mx-auto px-5 mb-5");
    			attr(section2, "class", "my-7");
    			attr(div13, "class", "lg:text-3xl text-lg font-bold text-gray-900 p-4");
    			attr(hr0, "class", "my-2 bg-gray-300 px-4 mx-12 lg:mx-56");
    			attr(p4, "class", "text-base font-normal pt-5 lg:mx-20 mx-8 svelte-147ahzi");
    			set_style(p4, "font-size", "17px");
    			attr(div14, "class", "lg:text-3xl text-lg font-bold text-gray-900 p-4");
    			attr(hr1, "class", "my-2 bg-gray-300 px-4 mx-12 lg:mx-56");
    			attr(p5, "class", "text-base font-normal pt-5 lg:mx-20 mx-8 svelte-147ahzi");
    			set_style(p5, "font-size", "17px");
    			attr(div15, "class", "mt-8 px-4 lg:grid grid-cols-4 gap-4 grid-rows-3 mb-8");
    			attr(section3, "class", "my-8");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    			append(main, section0);
    			append(main, t2);
    			append(main, div5);
    			append(main, t8);
    			append(main, section2);
    			append(main, t23);
    			append(main, section3);
    			append(section3, div13);
    			append(section3, t25);
    			append(section3, hr0);
    			append(section3, t26);
    			append(section3, p4);
    			append(section3, t39);
    			append(section3, div14);
    			append(section3, t41);
    			append(section3, hr1);
    			append(section3, t42);
    			append(section3, p5);
    			append(section3, t44);
    			append(section3, div15);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div15, null);
    			}

    			append(div15, t45);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div15, null);
    			}

    			append(div15, t46);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div15, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*invest, btc*/ 9) {
    				each_value_2 = /*btc*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div15, t45);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*alert, btcCash*/ 2) {
    				each_value_1 = /*btcCash*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div15, t46);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*alert, eth*/ 4) {
    				each_value = /*eth*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div15, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(main);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let btc;
    	let btcCash;
    	let eth;

    	_btc.subscribe(v => {
    		$$invalidate(0, btc = v);
    	});

    	_btcCash.subscribe(v => {
    		$$invalidate(1, btcCash = v);
    	});

    	_eth.subscribe(v => {
    		$$invalidate(2, eth = v);
    	});

    	const invest = function (options) {
    		const User = localStorage.getItem("User");

    		if (!User) {
    			alert("You need to login to make an investment");
    			push("/auth/signin");
    		} else {
    			const { id, name, email } = JSON.parse(localStorage.getItem("User"));
    			const { coin, price, type, profit } = options;

    			const investmentData = {
    				id,
    				name,
    				coin,
    				price,
    				profit,
    				email,
    				type
    			};

    			localStorage.setItem("investmentData", JSON.stringify(investmentData));
    			push("/investment/confirm");
    		}
    	};

    	const click_handler = (coin, price, type, profit) => invest({ coin, price, type, profit });
    	const click_handler_1 = () => alert("This investment is not currently available");
    	const click_handler_2 = () => alert("This investment is not currently available");
    	return [btc, btcCash, eth, invest, click_handler, click_handler_1, click_handler_2];
    }

    class PricingPage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, {});
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    /* src\components\SubRoutes\dashboard.svelte generated by Svelte v3.31.0 */

    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[1].message + "";
    	let t;

    	return {
    		c() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (48:32) {:then result}
    function create_then_block(ctx) {
    	let t0;
    	let t1_value = /*result*/ ctx[0] + "";
    	let t1;

    	return {
    		c() {
    			t0 = text("$");
    			t1 = text(t1_value);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (46:35)                                      <p>...waiting</p>                                 {:then result}
    function create_pending_block(ctx) {
    	let p;

    	return {
    		c() {
    			p = element("p");
    			p.textContent = "...waiting";
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let div44;
    	let div43;
    	let div33;
    	let div31;
    	let div5;
    	let t4;
    	let div11;
    	let div10;
    	let div9;
    	let div7;
    	let t5;
    	let div8;
    	let h51;
    	let t7;
    	let h31;
    	let promise;
    	let t8;
    	let span1;
    	let t9;
    	let div17;
    	let t14;
    	let div23;
    	let t19;
    	let div29;
    	let t24;
    	let div30;
    	let t25;
    	let div32;
    	let t26;
    	let hr;
    	let t27;
    	let div37;
    	let t28;
    	let div39;
    	let t33;
    	let button;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0,
    		error: 1
    	};

    	handle_promise(
    		promise = axios$1({
    			url: `https://gql-2.vercel.app/api/earning/${JSON.parse(localStorage.getItem("User")).id}`,
    			method: "get"
    		}),
    		info
    	);

    	return {
    		c() {
    			div44 = element("div");
    			div43 = element("div");
    			div33 = element("div");
    			div31 = element("div");
    			div5 = element("div");

    			div5.innerHTML = `<div class="bg-white border rounded shadow p-2"><div class="flex flex-row items-center"><div class="flex-shrink pr-4"><div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div></div> 
                        <div class="flex-1 text-right md:text-center"><h5 class="font-bold uppercase text-gray-500">BTC Wallet</h5> 
                            <h3 class="font-bold text-3xl">0 <span class="text-green-500"><i class="fas fa-caret-up"></i></span></h3></div></div></div>`;

    			t4 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			div7.innerHTML = `<div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div>`;
    			t5 = space();
    			div8 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Total BTC Earnings";
    			t7 = space();
    			h31 = element("h3");
    			info.block.c();
    			t8 = space();
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-caret-up"></i>`;
    			t9 = space();
    			div17 = element("div");

    			div17.innerHTML = `<div class="bg-white border rounded shadow p-2"><div class="flex flex-row items-center"><div class="flex-shrink pr-4"><div class="rounded p-3 bg-pink-600"><i class="fas fa-shopping_cart fa-2x fa-fw fa-inverse"></i></div></div> 
                        <div class="flex-1 text-right md:text-center"><h5 class="font-bold uppercase text-gray-500">All Withdrawals</h5> 
                            <h3 class="font-bold text-3xl">\$0 <span class="text-pink-500"><i class="fas fa-exchange-alt"></i></span></h3></div></div></div>`;

    			t14 = space();
    			div23 = element("div");

    			div23.innerHTML = `<div class="bg-white border rounded shadow p-2"><div class="flex flex-row items-center"><div class="flex-shrink pr-4"><div class="rounded p-3 bg-red-600"><i class="fas fa-inbox fa-2x fa-fw fa-inverse"></i></div></div> 
                        <div class="flex-1 text-right md:text-center"><h5 class="font-bold uppercase text-gray-500">Btc Wallet Address</h5> 
                            <h3 class="font-bold text-3xl">xxxxxxx <span class="text-red-500"><i class="fas fa-caret-up"></i></span></h3></div></div></div>`;

    			t19 = space();
    			div29 = element("div");

    			div29.innerHTML = `<div class="bg-white border rounded shadow p-2"><div class="flex flex-row items-center"><div class="flex-shrink pr-4"><div class="rounded p-3 bg-blue-600"><i class="fas fa-server fa-2x fa-fw fa-inverse"></i></div></div> 
                        <div class="flex-1 text-right md:text-center"><h5 class="font-bold uppercase text-gray-500">Server Uptime</h5> 
                            <h3 class="font-bold text-3xl">152 days</h3></div></div></div>`;

    			t24 = space();
    			div30 = element("div");
    			t25 = space();
    			div32 = element("div");
    			t26 = space();
    			hr = element("hr");
    			t27 = space();
    			div37 = element("div");
    			div37.innerHTML = `<div id="tradingview_73384"><div id="tradingview_efef3-wrapper" style="position: relative;box-sizing: content-box;width: 100%;height: 320px;margin: 0 auto !important;padding: 0 !important;font-family:Arial,sans-serif;"><div style="width: 100%;height: 320px;background: transparent;padding: 0 !important;"><iframe id="tradingview_efef3" src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_efef3&amp;symbol=BITSTAMP%3ABTCUSD&amp;interval=1&amp;hidesidetoolbar=0&amp;symboledit=1&amp;saveimage=1&amp;toolbarbg=f1f3f6&amp;details=1&amp;calendar=1&amp;hotlist=1&amp;studies=%5B%5D&amp;theme=Light&amp;style=1&amp;timezone=Etc%2FUTC&amp;withdateranges=1&amp;studies_overrides=%7B%7D&amp;overrides=%7B%7D&amp;enabled_features=%5B%5D&amp;disabled_features=%5B%5D&amp;locale=en&amp;utm_source=anyoption.online&amp;utm_medium=widget&amp;utm_campaign=chart&amp;utm_term=BITSTAMP%3ABTCUSD" style="width: 100%; height: 100%; margin: 0 !important; padding: 0 !important;" frameborder="0" allowtransparency="true" scrolling="no" allowfullscreen=""></iframe></div></div></div>`;
    			t28 = space();
    			div39 = element("div");

    			div39.innerHTML = `<h4 class="text-lg text-gray-500 py-4">Exchange Market</h4> 

            <div class="tradingview-widget-container" style="width: 100%; height: 540px;"><iframe allowtransparency="true" frameborder="0" src="https://s.tradingview.com/embed-widget/crypto-mkt-screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A540%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22crypto_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22light%22%2C%22market%22%3A%22crypto%22%2C%22enableScrolling%22%3Atrue%2C%22utm_source%22%3A%22anyoption.online%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22cryptomktscreener%22%7D" style="box-sizing: border-box; height: 540px; width: 100%;"></iframe> 
                
              <style>.tradingview-widget-copyright {
                      font-size: 13px !important;
                      line-height: 32px !important;
                      text-align: center !important;
                      vertical-align: middle !important;
                      font-family: 'Trebuchet MS', Arial, sans-serif !important;
                      color: #9db2bd !important;
                  }
              
                  .tradingview-widget-copyright .blue-text {
                      color: #2196f3 !important;
                  }
              
                  .tradingview-widget-copyright a {
                      text-decoration: none !important;
                      color: #9db2bd !important;
                  }
              
                  .tradingview-widget-copyright a:visited {
                      color: #9db2bd !important;
                  }
              
                  .tradingview-widget-copyright a:hover .blue-text {
                      color: #38acdb !important;
                  }
              
                  .tradingview-widget-copyright a:active .blue-text {
                      color: #299dcd !important;
                  }
              
                  .tradingview-widget-copyright a:visited .blue-text {
                      color: #2196f3 !important;
                  }</style></div>`;

    			t33 = space();
    			button = element("button");

    			button.innerHTML = `<div class="flex-shrink pr-4"><div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div></div> 
        <div class="flex-1 text-right md:text-center"><h4 class="font-bold uppercase text-black">Withdraw</h4></div>`;

    			attr(div5, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div7, "class", "flex-shrink pr-4");
    			attr(h51, "class", "font-bold uppercase text-gray-500");
    			attr(span1, "class", "text-green-500");
    			attr(h31, "class", "font-bold text-3xl");
    			attr(div8, "class", "flex-1 text-right md:text-center");
    			attr(div9, "class", "flex flex-row items-center");
    			attr(div10, "class", "bg-white border rounded shadow p-2");
    			attr(div11, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div17, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div23, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div29, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div30, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div31, "class", "flex flex-wrap");
    			attr(div32, "class", "w-full md:w-1/2 xl:w-1/3 p-3");
    			attr(div33, "class", "w-full px-4 md:px-0 md:mt-8 mb-16 text-gray-800 leading-normal");
    			attr(hr, "class", "border-b-2 border-gray-400 mx-4");
    			attr(div37, "class", "border border-gray-500 px-3 py-3 mb-5");
    			attr(div39, "class", "border border-gray-500 px-3 py-3 mb-4");
    			attr(button, "class", "px-3 py-4 bg-white text-center text-white text-xl mb-4 flex flex-row items-center rounded border border-gray-500");
    			attr(div43, "class", "container w-full mx-auto pt-20");
    		},
    		m(target, anchor) {
    			insert(target, div44, anchor);
    			append(div44, div43);
    			append(div43, div33);
    			append(div33, div31);
    			append(div31, div5);
    			append(div31, t4);
    			append(div31, div11);
    			append(div11, div10);
    			append(div10, div9);
    			append(div9, div7);
    			append(div9, t5);
    			append(div9, div8);
    			append(div8, h51);
    			append(div8, t7);
    			append(div8, h31);
    			info.block.m(h31, info.anchor = null);
    			info.mount = () => h31;
    			info.anchor = t8;
    			append(h31, t8);
    			append(h31, span1);
    			append(div31, t9);
    			append(div31, div17);
    			append(div31, t14);
    			append(div31, div23);
    			append(div31, t19);
    			append(div31, div29);
    			append(div31, t24);
    			append(div31, div30);
    			append(div33, t25);
    			append(div33, div32);
    			append(div43, t26);
    			append(div43, hr);
    			append(div43, t27);
    			append(div43, div37);
    			append(div43, t28);
    			append(div43, div39);
    			append(div43, t33);
    			append(div43, button);
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div44);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};
    }

    class Dashboard extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$8, safe_not_equal, {});
    	}
    }

    /* src\components\SubRoutes\notifications.svelte generated by Svelte v3.31.0 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i].subject;
    	child_ctx[4] = list[i].body;
    	child_ctx[5] = list[i].date;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (33:8) {#each data as {subject, body, date}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*index*/ ctx[7] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*subject*/ ctx[3] + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*date*/ ctx[5] + "";
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*subject*/ ctx[3], /*date*/ ctx[5], /*body*/ ctx[4]);
    	}

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr(td0, "class", "border px-8 py-4");
    			attr(td1, "class", "border px-8 py-4");
    			attr(td2, "class", "border px-8 py-4");
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);

    			if (!mounted) {
    				dispose = listen(td1, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let div;
    	let table;
    	let tr;
    	let t5;
    	let each_value = /*data*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");
    			table = element("table");
    			tr = element("tr");

    			tr.innerHTML = `<th class="bg-blue-100 border text-left px-8 py-4">Id</th> 
            <th class="bg-blue-100 border text-left px-8 py-4">Subject</th> 
            <th class="bg-blue-100 border text-left px-8 py-4">Date</th>`;

    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(table, "class", "shadow-lg bg-white");
    			attr(div, "class", "container mx-auto my-6 lg:px-5");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, table);
    			append(table, tr);
    			append(table, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*data, openBody*/ 3) {
    				each_value = /*data*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$6($$self) {
    	let data = [
    		{
    			subject: "Blah",
    			date: "022-5-89",
    			body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, placeat."
    		},
    		{
    			subject: "Blah2",
    			date: "072-5-89",
    			body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, placeat."
    		}
    	];

    	const openBody = function (options) {
    		notification_body.update(v => {
    			return { title: "", body: "", date: "" };
    		});

    		push("/admin/notification");
    	};

    	const click_handler = (subject, date, body) => openBody();
    	return [data, openBody, click_handler];
    }

    class Notifications extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$9, safe_not_equal, {});
    	}
    }

    /* src\components\SubRoutes\notificationSingle.svelte generated by Svelte v3.31.0 */

    function create_fragment$a(ctx) {
    	let h1;
    	let t;

    	return {
    		c() {
    			h1 = element("h1");
    			t = text(/*subject*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, h1, anchor);
    			append(h1, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*subject*/ 1) set_data(t, /*subject*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(h1);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let body = "";
    	let subject = "";
    	let date = "";

    	notification_body.subscribe(v => {
    		console.log(v);
    		body = v.body;
    		$$invalidate(0, subject = v.title);
    		date = v.date;
    	});

    	onDestroy(() => {
    		notification_body.update(v => {
    			return { title: "", body: "", date: "" };
    		});
    	});

    	return [subject];
    }

    class NotificationSingle extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$a, safe_not_equal, {});
    	}
    }

    /* src\components\Dashboard.svelte generated by Svelte v3.31.0 */

    const { document: document_1 } = globals;

    function create_else_block$2(ctx) {
    	let nav;
    	let div9;
    	let div0;
    	let t1;
    	let div5;
    	let div4;
    	let div2;
    	let button0;
    	let img;
    	let img_src_value;
    	let t2;
    	let span0;
    	let t5;
    	let svg0;
    	let g;
    	let path0;
    	let t6;
    	let div1;
    	let t8;
    	let div3;
    	let button1;
    	let t10;
    	let div8;
    	let t16;
    	let router;
    	let current;
    	router = new Router({ props: { routes: /*routes*/ ctx[4] } });

    	return {
    		c() {
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<a class="text-gray-900 text-base xl:text-xl no-underline hover:no-underline font-bold" href="/"><i class="fas fa-sun text-pink-600 pr-3"></i> ETORO</a>`;
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			img = element("img");
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = `Hi, ${JSON.parse(localStorage.getItem("User")).name}`;
    			t5 = space();
    			svg0 = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			t6 = space();
    			div1 = element("div");
    			div1.innerHTML = `<ul class="list-reset"><li><a href="#" class="px-4 py-2 block text-gray-900 hover:bg-gray-400 no-underline hover:no-underline">Logout</a></li></ul>`;
    			t8 = space();
    			div3 = element("div");
    			button1 = element("button");
    			button1.innerHTML = `<svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path></svg>`;
    			t10 = space();
    			div8 = element("div");

    			div8.innerHTML = `<ul class="list-reset lg:flex flex-1 items-center px-4 md:px-0"><li class="mr-6 my-2 md:my-0"><a href="/" class="block py-1 md:py-3 pl-1 align-middle text-pink-600 no-underline hover:text-gray-900 border-b-2 border-orange-600 hover:border-orange-600"><i class="fas fa-home fa-fw mr-3 text-pink-600"></i><span class="pb-1 md:pb-0 text-sm">Home</span></a></li> 
                
                <li class="mr-6 my-2 md:my-0"><a href="#" class="block py-1 md:py-3 pl-1 align-middle text-gray-500 no-underline hover:text-gray-900 border-b-2 border-white hover:border-purple-500"><i class="fa fa-envelope fa-fw mr-3"></i><span class="pb-1 md:pb-0 text-sm">Notifications</span></a></li></ul> 

            <div class="relative pull-right pl-4 pr-4 md:pr-0"><input type="search" placeholder="Search" class="w-full bg-gray-100 text-sm text-gray-800 transition border focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal"/> 
                <div class="absolute search-icon" style="top: 0.375rem;left: 1.75rem;"><svg class="fill-current pointer-events-none text-gray-800 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"></path></svg></div></div>`;

    			t16 = space();
    			create_component(router.$$.fragment);
    			attr(div0, "class", "w-1/2 pl-2 md:pl-0");
    			attr(img, "class", "w-8 h-8 rounded-full mr-4");
    			if (img.src !== (img_src_value = "https://www.flaticon.com/premium-icon/icons/svg/666/666201.svg")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Avatar of User");
    			attr(span0, "class", "hidden md:inline-block");
    			attr(path0, "d", "m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z");
    			attr(svg0, "class", "pl-2 h-2");
    			attr(svg0, "version", "1.1");
    			attr(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg0, "viewBox", "0 0 129 129");
    			attr(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg0, "enable-background", "new 0 0 129 129");
    			attr(button0, "id", "userButton");
    			attr(button0, "class", "flex items-center focus:outline-none mr-3");
    			attr(div1, "id", "userMenu");
    			attr(div1, "class", "bg-white rounded shadow-md mt-2 absolute mt-12 top-0 right-0 min-w-full overflow-auto z-30 invisible");
    			attr(div2, "class", "relative text-sm");
    			attr(button1, "id", "nav-toggle");
    			attr(button1, "class", "flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-gray-900 hover:border-teal-500 appearance-none focus:outline-none");
    			attr(div3, "class", "block lg:hidden pr-4");
    			attr(div4, "class", "flex relative inline-block float-right");
    			attr(div5, "class", "w-1/2 pr-0");
    			attr(div8, "class", "w-full flex-grow lg:flex lg:items-center lg:w-auto hidden lg:block mt-2 lg:mt-0 bg-white z-20");
    			attr(div8, "id", "nav-content");
    			attr(div9, "class", "w-full container mx-auto flex flex-wrap items-center mt-0 pt-3 pb-3 md:pb-0");
    			attr(nav, "id", "header");
    			attr(nav, "class", "bg-white fixed w-full z-10 top-0 shadow");
    		},
    		m(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, div9);
    			append(div9, div0);
    			append(div9, t1);
    			append(div9, div5);
    			append(div5, div4);
    			append(div4, div2);
    			append(div2, button0);
    			append(button0, img);
    			append(button0, t2);
    			append(button0, span0);
    			append(button0, t5);
    			append(button0, svg0);
    			append(svg0, g);
    			append(g, path0);
    			/*button0_binding*/ ctx[5](button0);
    			append(div2, t6);
    			append(div2, div1);
    			/*div1_binding*/ ctx[6](div1);
    			append(div4, t8);
    			append(div4, div3);
    			append(div3, button1);
    			/*button1_binding*/ ctx[7](button1);
    			append(div9, t10);
    			append(div9, div8);
    			/*div8_binding*/ ctx[8](div8);
    			insert(target, t16, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(nav);
    			/*button0_binding*/ ctx[5](null);
    			/*div1_binding*/ ctx[6](null);
    			/*button1_binding*/ ctx[7](null);
    			/*div8_binding*/ ctx[8](null);
    			if (detaching) detach(t16);
    			destroy_component(router, detaching);
    		}
    	};
    }

    // (95:0) {#if !localStorage.getItem('User')}
    function create_if_block$3(ctx) {
    	let t_value = push("/auth/signin") + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let link;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!localStorage.getItem("User")) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type();
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			link = element("link");
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", "https://use.fontawesome.com/releases/v5.3.1/css/all.css");
    			attr(link, "integrity", "sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU");
    			attr(link, "crossorigin", "anonymous");
    		},
    		m(target, anchor) {
    			append(document_1.head, link);
    			insert(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			detach(link);
    			if (detaching) detach(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function checkParent(t, elm) {
    	while (t.parentNode) {
    		if (t == elm) {
    			return true;
    		}

    		t = t.parentNode;
    	}

    	return false;
    }

    function instance$8($$self, $$props, $$invalidate) {

    	const routes = {
    		"/admin/dashboard": Dashboard,
    		"/admin/notifications": Notifications,
    		"/admin/notification": NotificationSingle
    	};

    	let _userMenuDiv;
    	let _userMenu;
    	let _navMenuDiv;
    	let _navMenu;
    	let userMenuDiv;
    	let userMenu;
    	let navMenuDiv;
    	let navMenu;

    	onMount(() => {
    		userMenuDiv = _userMenuDiv;
    		userMenu = _userMenu;
    		navMenuDiv = _navMenuDiv;
    		navMenu = _navMenu;
    	});

    	document.onclick = check;

    	function check(e) {
    		let target = e && e.target || event && event.srcElement;

    		//User Menu
    		if (!checkParent(target, userMenuDiv)) {
    			// click NOT on the menu
    			if (checkParent(target, userMenu)) {
    				// click on the link
    				if (userMenuDiv.classList.contains("invisible")) {
    					userMenuDiv.classList.remove("invisible");
    				} else {
    					userMenuDiv.classList.add("invisible");
    				}
    			} else {
    				// click both outside link and outside menu, hide menu
    				userMenuDiv.classList.add("invisible");
    			}
    		}

    		// Nav Menu
    		if (!checkParent(target, navMenuDiv)) {
    			// click NOT on the menu
    			if (checkParent(target, navMenu)) {
    				// click on the link
    				if (navMenuDiv.classList.contains("hidden")) {
    					navMenuDiv.classList.remove("hidden");
    				} else {
    					navMenuDiv.classList.add("hidden");
    				}
    			} else {
    				// click both outside link and outside menu, hide menu
    				navMenuDiv.classList.add("hidden");
    			}
    		}
    	}

    	function button0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			_userMenu = $$value;
    			$$invalidate(1, _userMenu);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			_userMenuDiv = $$value;
    			$$invalidate(0, _userMenuDiv);
    		});
    	}

    	function button1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			_navMenu = $$value;
    			$$invalidate(3, _navMenu);
    		});
    	}

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			_navMenuDiv = $$value;
    			$$invalidate(2, _navMenuDiv);
    		});
    	}

    	return [
    		_userMenuDiv,
    		_userMenu,
    		_navMenuDiv,
    		_navMenu,
    		routes,
    		button0_binding,
    		div1_binding,
    		button1_binding,
    		div8_binding
    	];
    }

    class Dashboard$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$b, safe_not_equal, {});
    	}
    }

    /* src\pages\trade.svelte generated by Svelte v3.31.0 */

    function create_fragment$c(ctx) {
    	let t;
    	let dashboard;
    	let current;
    	dashboard = new Dashboard$1({});

    	return {
    		c() {
    			t = space();
    			create_component(dashboard.$$.fragment);
    			document.title = "Dashboard | Binterest";
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    			destroy_component(dashboard, detaching);
    		}
    	};
    }

    function instance$9($$self) {
    	const _authFound = JSON.parse(localStorage.getItem("Auth"));

    	return [];
    }

    class Trade extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$c, safe_not_equal, {});
    	}
    }

    /* src\authPages\signup.svelte generated by Svelte v3.31.0 */

    function create_if_block_1(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*error_*/ ctx[0]);
    			attr(span, "class", "bg-red-500 border-4 border-red-400 text-white text-center p-2");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*error_*/ 1) set_data(t, /*error_*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (223:5) {#if error_ !== ''}
    function create_if_block$4(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*error_*/ ctx[0]);
    			attr(span, "class", "bg-red-500 border-4 border-red-400 text-white text-center p-2");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*error_*/ 1) set_data(t, /*error_*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	let t0;
    	let main;
    	let div12;
    	let div11;
    	let div0;
    	let t1;
    	let div10;
    	let section;
    	let t5;
    	let t6;
    	let form;
    	let div2;
    	let div1;
    	let label0;
    	let t8;
    	let input0;
    	let t9;
    	let div3;
    	let label1;
    	let t11;
    	let input1;
    	let t12;
    	let div4;
    	let label2;
    	let t14;
    	let input2;
    	let t15;
    	let div6;
    	let div5;
    	let label3;
    	let t17;
    	let input3;
    	let t18;
    	let div8;
    	let div7;
    	let label4;
    	let t20;
    	let input4;
    	let t21;
    	let t22;
    	let button;
    	let t24;
    	let div9;
    	let p1;
    	let t25;
    	let a;
    	let mounted;
    	let dispose;
    	let if_block0 = /*error_*/ ctx[0] !== "" && create_if_block_1(ctx);
    	let if_block1 = /*error_*/ ctx[0] !== "" && create_if_block$4(ctx);

    	return {
    		c() {
    			t0 = space();
    			main = element("main");
    			div12 = element("div");
    			div11 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div10 = element("div");
    			section = element("section");

    			section.innerHTML = `<h3 class="font-bold text-2xl">Welcome to Binterest</h3> 
					<p class="text-gray-600 pt-2">Sign up for an account.</p>`;

    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			form = element("form");
    			div2 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			div4 = element("div");
    			label2 = element("label");
    			label2.textContent = "Password";
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			div6 = element("div");
    			div5 = element("div");
    			label3 = element("label");
    			label3.textContent = "Repeat Password";
    			t17 = space();
    			input3 = element("input");
    			t18 = space();
    			div8 = element("div");
    			div7 = element("div");
    			label4 = element("label");
    			label4.textContent = "Country";
    			t20 = space();
    			input4 = element("input");
    			t21 = space();
    			if (if_block1) if_block1.c();
    			t22 = space();
    			button = element("button");
    			button.textContent = "Sign Up";
    			t24 = space();
    			div9 = element("div");
    			p1 = element("p");
    			t25 = text("Have an account already? \n\t\t\t\t\t\t\n\t\t\t\t\t\t");
    			a = element("a");
    			a.textContent = "Sign In";
    			document.title = "Account | Binterest";
    			attr(section, "class", "my-4");
    			set_style(label0, "font-size", "20px");
    			attr(label0, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input0, "placeholder", "Enter Fullname");
    			attr(input0, "type", "text");
    			attr(input0, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div2, "class", "my-3 text-left");
    			set_style(label1, "font-size", "20px");
    			attr(label1, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input1, "placeholder", "Enter Email");
    			attr(input1, "type", "email");
    			attr(input1, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div3, "class", "my-3 text-left");
    			set_style(label2, "font-size", "20px");
    			attr(label2, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input2, "placeholder", "Enter Password");
    			attr(input2, "type", "password");
    			attr(input2, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div4, "class", "my-3 text-left");
    			set_style(label3, "font-size", "20px");
    			attr(label3, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input3, "placeholder", "Reapet Password");
    			attr(input3, "type", "password");
    			attr(input3, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div6, "class", "my-3 text-left");
    			set_style(label4, "font-size", "20px");
    			attr(label4, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input4, "placeholder", "Enter Country");
    			attr(input4, "type", "text");
    			attr(input4, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div8, "class", "my-3 text-left");
    			attr(button, "class", "bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200");
    			attr(button, "type", "submit");
    			attr(form, "class", "flex flex-col");
    			attr(a, "class", "font-bold hover:underline");
    			attr(p1, "class", "text-gray-900");
    			attr(div9, "class", "max-w-lg mx-auto text-center mt-12 mb-6");
    			attr(div10, "class", "flex flex-col px-2 lg:mx-0 mx-4");
    			attr(div11, "class", "flex flex-row");
    			attr(div12, "class", "flex flex-col text-center justify-center");
    			set_style(div12, "align-items", "center");
    			set_style(div12, "min-height", "100vh");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    			append(main, div12);
    			append(div12, div11);
    			append(div11, div0);
    			append(div11, t1);
    			append(div11, div10);
    			append(div10, section);
    			append(div10, t5);
    			if (if_block0) if_block0.m(div10, null);
    			append(div10, t6);
    			append(div10, form);
    			append(form, div2);
    			append(div2, div1);
    			append(div1, label0);
    			append(div1, t8);
    			append(div1, input0);
    			set_input_value(input0, /*name*/ ctx[1]);
    			append(form, t9);
    			append(form, div3);
    			append(div3, label1);
    			append(div3, t11);
    			append(div3, input1);
    			set_input_value(input1, /*email*/ ctx[2]);
    			append(form, t12);
    			append(form, div4);
    			append(div4, label2);
    			append(div4, t14);
    			append(div4, input2);
    			set_input_value(input2, /*password*/ ctx[3]);
    			append(form, t15);
    			append(form, div6);
    			append(div6, div5);
    			append(div5, label3);
    			append(div5, t17);
    			append(div5, input3);
    			set_input_value(input3, /*repeatePassword*/ ctx[4]);
    			append(form, t18);
    			append(form, div8);
    			append(div8, div7);
    			append(div7, label4);
    			append(div7, t20);
    			append(div7, input4);
    			set_input_value(input4, /*country*/ ctx[5]);
    			append(form, t21);
    			if (if_block1) if_block1.m(form, null);
    			append(form, t22);
    			append(form, button);
    			append(div10, t24);
    			append(div10, div9);
    			append(div9, p1);
    			append(p1, t25);
    			append(p1, a);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen(input0, "change", /*change_handler*/ ctx[9]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[11]),
    					listen(input3, "change", /*change_handler_1*/ ctx[12]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[13]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[14]),
    					listen(input4, "change", /*change_handler_2*/ ctx[15]),
    					listen(button, "click", /*click_handler*/ ctx[16]),
    					listen(form, "submit", prevent_default(/*submit_handler*/ ctx[17])),
    					listen(a, "click", /*click_handler_1*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*error_*/ ctx[0] !== "") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div10, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*name*/ 2 && input0.value !== /*name*/ ctx[1]) {
    				set_input_value(input0, /*name*/ ctx[1]);
    			}

    			if (dirty & /*email*/ 4 && input1.value !== /*email*/ ctx[2]) {
    				set_input_value(input1, /*email*/ ctx[2]);
    			}

    			if (dirty & /*password*/ 8 && input2.value !== /*password*/ ctx[3]) {
    				set_input_value(input2, /*password*/ ctx[3]);
    			}

    			if (dirty & /*repeatePassword*/ 16 && input3.value !== /*repeatePassword*/ ctx[4]) {
    				set_input_value(input3, /*repeatePassword*/ ctx[4]);
    			}

    			if (dirty & /*country*/ 32 && input4.value !== /*country*/ ctx[5]) {
    				set_input_value(input4, /*country*/ ctx[5]);
    			}

    			if (/*error_*/ ctx[0] !== "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(form, t22);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function validateEmail(_email_) {
    	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(_email_);
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let error_ = "";
    	let name = "";
    	let email = "";
    	let password = "";
    	let repeatePassword = "";
    	let country = "";

    	const handleChange = function (_name) {
    		if (_name == "repeatePassword") {
    			if (repeatePassword.trim() == "") {
    				return;
    			}

    			if (password.trim() !== repeatePassword) {
    				return;
    			}
    		} else if (_name == "name") {
    			if (name.trim() == "") {
    				return;
    			}
    		} else if (_name == "country") {
    			if (country.trim() == "") {
    				return;
    			}
    		}
    	};

    	const signUp = e => {
    		e.preventDefault();

    		// error_ = '';
    		if (name.trim() == "") {
    			$$invalidate(0, error_ = "Name Field Should Not Be Empty");
    			return;
    		} else if (email == "") {
    			$$invalidate(0, error_ = "Email Field Should Not Be Empty");
    			return;
    		} else if (!validateEmail(email)) {
    			$$invalidate(0, error_ = "You Must Enter A Correct Email Address");
    			return;
    		} else if (password == "") {
    			$$invalidate(0, error_ = "Password Field Should Not Be Empty");
    			return;
    		} else if (repeatePassword.trim() == "") {
    			$$invalidate(0, error_ = "Repeated Password Field Should Not Be Empty");
    			return;
    		} else if (repeatePassword !== password.trim()) {
    			$$invalidate(0, error_ = "The Password Should Match With The Repeated One");
    			return;
    		} else if (country.trim() == "") {
    			$$invalidate(0, error_ = "Country Field Should Not Be Empty");
    			return;
    		} else {
    			$$invalidate(0, error_ = "");
    		}

    		$$invalidate(0, error_ = "Hold On");

    		axios$1({
    			url: "https://gql-2.vercel.app/api/signup",
    			method: "post",
    			data: {
    				args: {
    					name: `${name.trim()}`,
    					email: `${email}`,
    					password: `${password}`,
    					country: `${country}`,
    					countryCode: "01547",
    					phoneNumber: "45789"
    				}
    			}
    		}).then(res => {
    			$$invalidate(0, error_ = "");

    			if (res.data.type === "Error") {
    				$$invalidate(0, error_ = res.data.message);
    			} else if (res.data.type == "Success") {
    				$$invalidate(1, name = "");
    				$$invalidate(2, email = "");
    				($$invalidate(3, password = ""), $$invalidate(5, country = ""));
    				push("/auth/signin");
    			}
    		}).catch(e => console.log(e));
    	}; // localStorage.setItem('Auth', JSON.stringify(data));
    	// alert('ok')

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	const change_handler = () => handleChange("name");

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(2, email);
    	}

    	function input2_input_handler() {
    		password = this.value;
    		$$invalidate(3, password);
    	}

    	const change_handler_1 = () => handleChange("repeatePassword");

    	function input3_input_handler() {
    		repeatePassword = this.value;
    		$$invalidate(4, repeatePassword);
    	}

    	function input4_input_handler() {
    		country = this.value;
    		$$invalidate(5, country);
    	}

    	const change_handler_2 = () => handleChange("country");
    	const click_handler = e => signUp(e);
    	const submit_handler = e => signUp(e);
    	const click_handler_1 = () => push("/auth/signin");

    	return [
    		error_,
    		name,
    		email,
    		password,
    		repeatePassword,
    		country,
    		handleChange,
    		signUp,
    		input0_input_handler,
    		change_handler,
    		input1_input_handler,
    		input2_input_handler,
    		change_handler_1,
    		input3_input_handler,
    		input4_input_handler,
    		change_handler_2,
    		click_handler,
    		submit_handler,
    		click_handler_1
    	];
    }

    class Signup extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$d, safe_not_equal, {});
    	}
    }

    /* src\authPages\signin.svelte generated by Svelte v3.31.0 */

    function create_if_block$5(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*error_*/ ctx[0]);
    			attr(span, "class", "bg-red-500 border-4 border-red-400 text-white text-center p-2");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*error_*/ 1) set_data(t, /*error_*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	let main;
    	let div6;
    	let div5;
    	let div0;
    	let t0;
    	let div4;
    	let section;
    	let t4;
    	let t5;
    	let form;
    	let div1;
    	let label0;
    	let t7;
    	let input0;
    	let t8;
    	let div2;
    	let label1;
    	let t10;
    	let input1;
    	let t11;
    	let button;
    	let t13;
    	let div3;
    	let p1;
    	let t14;
    	let a;
    	let mounted;
    	let dispose;
    	let if_block = /*error_*/ ctx[0] !== "" && create_if_block$5(ctx);

    	return {
    		c() {
    			main = element("main");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			section = element("section");

    			section.innerHTML = `<h3 class="font-bold text-2xl">Welcome to Binterest</h3> 
                        <p class="text-gray-600 pt-2">Sign in to your account.</p>`;

    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			button = element("button");
    			button.textContent = "Sign In";
    			t13 = space();
    			div3 = element("div");
    			p1 = element("p");
    			t14 = text("Dont have an account? \n                            \n                            ");
    			a = element("a");
    			a.textContent = "Sign Up";
    			attr(section, "class", "my-4");
    			set_style(label0, "font-size", "20px");
    			attr(label0, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input0, "placeholder", "Enter Email");
    			attr(input0, "type", "email");
    			attr(input0, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div1, "class", "my-3 text-left");
    			set_style(label1, "font-size", "20px");
    			attr(label1, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input1, "placeholder", "Enter Password");
    			attr(input1, "type", "password");
    			attr(input1, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			attr(div2, "class", "my-3 text-left");
    			attr(button, "class", "bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200");
    			attr(button, "type", "submit");
    			attr(form, "class", "flex flex-col");
    			attr(a, "class", "font-bold hover:underline");
    			attr(p1, "class", "text-gray-900");
    			attr(div3, "class", "max-w-lg mx-auto text-center mt-12 mb-6");
    			attr(div4, "class", "flex flex-col px-2 lg:mx-0 mx-4");
    			attr(div5, "class", "flex flex-row");
    			attr(div6, "class", "flex flex-col text-center justify-center");
    			set_style(div6, "align-items", "center");
    			set_style(div6, "min-height", "100vh");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, div6);
    			append(div6, div5);
    			append(div5, div0);
    			append(div5, t0);
    			append(div5, div4);
    			append(div4, section);
    			append(div4, t4);
    			if (if_block) if_block.m(div4, null);
    			append(div4, t5);
    			append(div4, form);
    			append(form, div1);
    			append(div1, label0);
    			append(div1, t7);
    			append(div1, input0);
    			set_input_value(input0, /*email*/ ctx[1]);
    			append(form, t8);
    			append(form, div2);
    			append(div2, label1);
    			append(div2, t10);
    			append(div2, input1);
    			set_input_value(input1, /*password*/ ctx[2]);
    			append(form, t11);
    			append(form, button);
    			append(div4, t13);
    			append(div4, div3);
    			append(div3, p1);
    			append(p1, t14);
    			append(p1, a);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen(button, "click", /*click_handler*/ ctx[6]),
    					listen(form, "submit", prevent_default(/*submit_handler*/ ctx[7])),
    					listen(a, "click", /*click_handler_1*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*error_*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div4, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*email*/ 2 && input0.value !== /*email*/ ctx[1]) {
    				set_input_value(input0, /*email*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 4 && input1.value !== /*password*/ ctx[2]) {
    				set_input_value(input1, /*password*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let error_ = "";
    	let email = "";
    	let password = "";

    	const signin = function () {
    		if (email == "") {
    			$$invalidate(0, error_ = "Email Field Should Not Be Empty");
    			return;
    		} else if (password == "") {
    			$$invalidate(0, error_ = "Password Field Should Not Be Empty");
    			return;
    		} else {
    			$$invalidate(0, error_ = "");
    		}

    		axios$1.get(`https://gql-2.vercel.app/api/signin/${email}/${password}`).then(res => {
    			if (res.data.type == "Error") {
    				$$invalidate(0, error_ = res.data.message);
    				return;
    			} else if (res.data.type == "Invalid") {
    				$$invalidate(0, error_ = res.data.message);
    				return;
    			} else if (res.data.type == "Success") {
    				$$invalidate(0, error_ = "");
    				$$invalidate(1, email = "");
    				$$invalidate(2, password = "");
    				console.log(res.data.message[0]);
    				localStorage.setItem("User", JSON.stringify(res.data.message[0]));
    				localStorage.setItem("token", res.data.message[0].token);
    				push("/admin/dashboard");
    			}
    		}).catch(e => console.log(e));
    	};

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(2, password);
    	}

    	const click_handler = () => signin();
    	const submit_handler = () => signin();
    	const click_handler_1 = () => push("/auth/signup");

    	return [
    		error_,
    		email,
    		password,
    		signin,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		submit_handler,
    		click_handler_1
    	];
    }

    class Signin extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$e, safe_not_equal, {});
    	}
    }

    /* src\components\invest.svelte generated by Svelte v3.31.0 */

    function create_else_block$3(ctx) {
    	let main;
    	let div10;
    	let div9;
    	let div0;
    	let t0;
    	let div8;
    	let section;
    	let t2;
    	let t3;
    	let form;
    	let div1;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let div2;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let div3;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let div4;
    	let label3;
    	let t14;
    	let input3;
    	let t15;
    	let div5;
    	let label4;
    	let t17;
    	let input4;
    	let t18;
    	let div6;
    	let label5;
    	let t20;
    	let input5;
    	let t21;
    	let div7;
    	let label6;
    	let t23;
    	let input6;
    	let t24;
    	let button0;
    	let t26;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block = /*error_*/ ctx[0] !== "" && create_if_block_1$1(ctx);

    	return {
    		c() {
    			main = element("main");
    			div10 = element("div");
    			div9 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div8 = element("div");
    			section = element("section");
    			section.innerHTML = `<h3 class="font-bold text-2xl">Confirm Investment Plan</h3>`;
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Id";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Name";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Email";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Coin";
    			t14 = space();
    			input3 = element("input");
    			t15 = space();
    			div5 = element("div");
    			label4 = element("label");
    			label4.textContent = "Price";
    			t17 = space();
    			input4 = element("input");
    			t18 = space();
    			div6 = element("div");
    			label5 = element("label");
    			label5.textContent = "Profit";
    			t20 = space();
    			input5 = element("input");
    			t21 = space();
    			div7 = element("div");
    			label6 = element("label");
    			label6.textContent = "Type of Investment";
    			t23 = space();
    			input6 = element("input");
    			t24 = space();
    			button0 = element("button");
    			button0.textContent = "Confirm";
    			t26 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr(section, "class", "my-4");
    			set_style(label0, "font-size", "20px");
    			attr(label0, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input0, "placeholder", "Enter Email");
    			attr(input0, "type", "email");
    			attr(input0, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input0.value = /*id*/ ctx[1];
    			input0.disabled = true;
    			attr(div1, "class", "my-3 text-left");
    			set_style(label1, "font-size", "20px");
    			attr(label1, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input1, "placeholder", "Enter Email");
    			attr(input1, "type", "email");
    			attr(input1, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input1.value = /*name*/ ctx[2];
    			input1.disabled = true;
    			attr(div2, "class", "my-3 text-left");
    			set_style(label2, "font-size", "20px");
    			attr(label2, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input2, "placeholder", "Enter Email");
    			attr(input2, "type", "email");
    			attr(input2, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input2.value = /*email*/ ctx[6];
    			input2.disabled = true;
    			attr(div3, "class", "my-3 text-left");
    			set_style(label3, "font-size", "20px");
    			attr(label3, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input3, "placeholder", "Enter Email");
    			attr(input3, "type", "email");
    			attr(input3, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input3.value = /*coin*/ ctx[3];
    			input3.disabled = true;
    			attr(div4, "class", "my-3 text-left");
    			set_style(label4, "font-size", "20px");
    			attr(label4, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input4, "placeholder", "Enter Email");
    			attr(input4, "type", "email");
    			attr(input4, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input4.value = /*price*/ ctx[4];
    			input4.disabled = true;
    			attr(div5, "class", "my-3 text-left");
    			set_style(label5, "font-size", "20px");
    			attr(label5, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input5, "placeholder", "Enter Email");
    			attr(input5, "type", "email");
    			attr(input5, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input5.value = /*profit*/ ctx[5];
    			input5.disabled = true;
    			attr(div6, "class", "my-3 text-left");
    			set_style(label6, "font-size", "20px");
    			attr(label6, "class", "text-gray-900 font-normal mb-2 text-left");
    			attr(input6, "placeholder", "Enter Email");
    			attr(input6, "type", "email");
    			attr(input6, "class", "focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1");
    			input6.value = /*type*/ ctx[7];
    			input6.disabled = true;
    			attr(div7, "class", "my-3 text-left");
    			attr(button0, "class", "bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200");
    			attr(button0, "type", "submit");
    			attr(button1, "class", "bg-red-600 mt-2 hover:bg-red-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200");
    			attr(button1, "type", "submit");
    			attr(form, "class", "flex flex-col");
    			attr(div8, "class", "flex flex-col px-2 lg:mx-0 mx-4");
    			attr(div9, "class", "flex flex-row");
    			attr(div10, "class", "flex flex-col text-center justify-center");
    			set_style(div10, "align-items", "center");
    			set_style(div10, "min-height", "100vh");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, div10);
    			append(div10, div9);
    			append(div9, div0);
    			append(div9, t0);
    			append(div9, div8);
    			append(div8, section);
    			append(div8, t2);
    			if (if_block) if_block.m(div8, null);
    			append(div8, t3);
    			append(div8, form);
    			append(form, div1);
    			append(div1, label0);
    			append(div1, t5);
    			append(div1, input0);
    			append(form, t6);
    			append(form, div2);
    			append(div2, label1);
    			append(div2, t8);
    			append(div2, input1);
    			append(form, t9);
    			append(form, div3);
    			append(div3, label2);
    			append(div3, t11);
    			append(div3, input2);
    			append(form, t12);
    			append(form, div4);
    			append(div4, label3);
    			append(div4, t14);
    			append(div4, input3);
    			append(form, t15);
    			append(form, div5);
    			append(div5, label4);
    			append(div5, t17);
    			append(div5, input4);
    			append(form, t18);
    			append(form, div6);
    			append(div6, label5);
    			append(div6, t20);
    			append(div6, input5);
    			append(form, t21);
    			append(form, div7);
    			append(div7, label6);
    			append(div7, t23);
    			append(div7, input6);
    			append(form, t24);
    			append(form, button0);
    			append(form, t26);
    			append(form, button1);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*confirm*/ ctx[8]),
    					listen(button1, "click", /*click_handler*/ ctx[10]),
    					listen(form, "submit", prevent_default(/*submit_handler*/ ctx[11]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*error_*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div8, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (27:0) {#if !localStorage.getItem('User')}
    function create_if_block$6(ctx) {
    	let t_value = push("/auth/signin") + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (39:20) {#if error_ !== ''}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*error_*/ ctx[0]);
    			attr(span, "class", "bg-red-500 border-4 border-red-400 text-white text-center p-2");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*error_*/ 1) set_data(t, /*error_*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (!localStorage.getItem("User")) return create_if_block$6;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type();
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let error_ = "";
    	let { id, name, coin, price, profit, email, type } = JSON.parse(localStorage.getItem("investmentData"));

    	const confirm = function () {
    		$$invalidate(0, error_ = "");

    		axios$1.post(`https://graphql-server001.herokuapp.com/user/transaction/${id}`, {
    			id,
    			name,
    			coin,
    			price,
    			profit,
    			email,
    			type
    		}).then(res => {
    			if (res.data.type == "Error") {
    				$$invalidate(0, error_ = res.data.message);
    				return;
    			} else if (res.data.type == "Success") {
    				alert(res.data.message);
    				push("/admin/dashboard");
    			}
    		});
    	};

    	const cancel = function () {
    		localStorage.removeItem("investmentData");
    		push("/");
    	};

    	const click_handler = () => cancel();
    	const submit_handler = () => confirm();

    	return [
    		error_,
    		id,
    		name,
    		coin,
    		price,
    		profit,
    		email,
    		type,
    		confirm,
    		cancel,
    		click_handler,
    		submit_handler
    	];
    }

    class Invest extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$f, safe_not_equal, {});
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.0 */

    function create_else_block_1(ctx) {
    	let nav;
    	let current;
    	nav = new Nav({});

    	return {
    		c() {
    			create_component(nav.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(nav, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(nav, detaching);
    		}
    	};
    }

    // (40:1) {#if $location === '/auth/signup' || $location === '/auth/signin' || $location === '/admin/dashboard' || $location === '/admin/notifications' || $location === '/admin/profile' || $location === '/admin/notification' || $location === '/investment/confirm'}
    function create_if_block_1$2(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (51:1) {:else}
    function create_else_block$4(ctx) {
    	let footer;
    	let current;
    	footer = new Footer({});

    	return {
    		c() {
    			create_component(footer.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(footer, detaching);
    		}
    	};
    }

    // (49:1) {#if $location === '/auth/signup' || $location === '/auth/signin' || $location === '/admin/dashboard' || $location === '/admin/notifications' || $location === '/admin/profile' || $location === '/admin/notification' || $location === '/investment/confirm'}
    function create_if_block$7(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let router;
    	let t1;
    	let current_block_type_index_1;
    	let if_block1;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$location*/ ctx[0] === "/auth/signup" || /*$location*/ ctx[0] === "/auth/signin" || /*$location*/ ctx[0] === "/admin/dashboard" || /*$location*/ ctx[0] === "/admin/notifications" || /*$location*/ ctx[0] === "/admin/profile" || /*$location*/ ctx[0] === "/admin/notification" || /*$location*/ ctx[0] === "/investment/confirm") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	router = new Router({ props: { routes: /*routes*/ ctx[1] } });
    	const if_block_creators_1 = [create_if_block$7, create_else_block$4];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$location*/ ctx[0] === "/auth/signup" || /*$location*/ ctx[0] === "/auth/signin" || /*$location*/ ctx[0] === "/admin/dashboard" || /*$location*/ ctx[0] === "/admin/notifications" || /*$location*/ ctx[0] === "/admin/profile" || /*$location*/ ctx[0] === "/admin/notification" || /*$location*/ ctx[0] === "/investment/confirm") return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	return {
    		c() {
    			main = element("main");
    			if_block0.c();
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			if_block1.c();
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			append(main, t0);
    			mount_component(router, main, null);
    			append(main, t1);
    			if_blocks_1[current_block_type_index_1].m(main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(main, t0);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 !== previous_block_index_1) {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(main, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(router.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(router.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if_blocks[current_block_type_index].d();
    			destroy_component(router);
    			if_blocks_1[current_block_type_index_1].d();
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $location;
    	component_subscribe($$self, location, $$value => $$invalidate(0, $location = $$value));

    	const routes = {
    		"/": Pages,
    		"/contact": Contact,
    		"/about": About,
    		"/investment-plans-page": PricingPage,
    		"/admin/*": Trade,
    		"/auth/signup": Signup,
    		"/auth/signin": Signin,
    		"/investment/confirm": Invest
    	};
    	return [$location, routes];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$d, create_fragment$g, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
