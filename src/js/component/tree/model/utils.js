export const NODE_KEY = '$treeNodeId';

export const markNodeData = (node, data) => {
    if (data[NODE_KEY]) return;
    Object.defineProperty(data, NODE_KEY, {
        value: node.id,
        enumerable: false,
        configurable: false,
        writable: false,
    });
};

export const getNodeKey = (key, data) => {
    if (!key) return data[NODE_KEY];
    return data[key];
};

export const getPropertyFromData = function(node, prop) {
    const props = node.store.props;
    const data = node.data || {};
    const config = props[prop];

    if (typeof config === 'function') {
        return config(data, node);
    } else if (typeof config === 'string') {
        return data[config];
    } else if (typeof config === 'undefined') {
        return '';
    }
    return '';
};

export const setPropertyForData = function(node, prop, value) {
    const props = node.store.props;
    const data = node.data || {};
    const config = props[prop];

    data[config] = value;
};
