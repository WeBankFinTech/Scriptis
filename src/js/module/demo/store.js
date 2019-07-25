export default {
    store: {
        state: {
            count: 0,
        },
        mutations: {
            increment(state) {
                state.count++;
            },
        },
        actions: {
            incrementIfOddOnRootSum({ state, commit, rootState }) {
                if ((state.count + rootState.count) % 2 === 1) {
                    commit('increment');
                }
            },
        },
    },
};
