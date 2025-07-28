import { PrefixSearchState } from "./PrefixSearchState";

export function clearState(state: PrefixSearchState) {
    state.searchActive = false;
    state.prefixRange = null;
    state.foundMatchRange = null;
}
