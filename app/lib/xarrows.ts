import * as rb from "react-xarrows";

const pkg = rb as any;

// Robust fallback chain for Vite/ESM/CJS interop
export const Xarrow = pkg.default?.default || pkg.default || pkg;
export const useXarrow = pkg.useXarrow || pkg.default?.useXarrow;
export const Xwrapper = pkg.Xwrapper || pkg.default?.Xwrapper;

export default Xarrow;
