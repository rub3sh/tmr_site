declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.glb' {
  const src: string;
  export default src;
}
