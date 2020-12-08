import { World } from '../../src';

const initialState = { paused: true, level: 1 };
type State = typeof initialState;

const togglePauseState = () => ({ type: 'TOGGLE-PAUSE-STATE' }) as const;
const levelUp = () => ({ type: 'LEVEL-UP' }) as const;
const reset = () => ({ type: 'RESET' }) as const;

export const worldActions = {
    togglePauseState,
    levelUp,
    reset,
};

const actionValues = Object.values(worldActions)[0];
export type Action = ReturnType<typeof actionValues>;

export const world = new World<State, Action>({
    initialState,
    reducer: (state, action) => {
        switch (action.type) {
            case 'TOGGLE-PAUSE-STATE':
                return { ...state, paused: !state.paused };
            case 'LEVEL-UP':
                return { ...state, level: state.level + 1 };
            case 'RESET':
                return { ...state, paused: true, level: 1 };
            default:
                return state;
        }
    }
});