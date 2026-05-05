declare module "text-to-svg" {
  type TextToSvgOptions = {
    x?: number;
    y?: number;
    fontSize?: number;
    kerning?: boolean;
    letterSpacing?: number;
    tracking?: number;
    anchor?: string;
    attributes?: Record<string, string | number>;
  };

  class TextToSVG {
    static loadSync(file?: string): TextToSVG;
    getPath(text: string, options?: TextToSvgOptions): string;
  }

  export default TextToSVG;
}
