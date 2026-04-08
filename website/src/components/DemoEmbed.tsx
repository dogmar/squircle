interface DemoEmbedProps {
  /** GitHub path relative to repo root, e.g. "website/examples/react-basic" */
  projectPath: string;
  /** File to open in the editor, e.g. "src/App.tsx" */
  file?: string;
  height?: number;
}

export default function DemoEmbed({
  projectPath,
  file = "src/App.tsx",
  height = 500,
}: DemoEmbedProps) {
  const repo = "dogmar/tw-squircle";
  const branch = "main";
  const src = `https://stackblitz.com/github/${repo}/tree/${branch}/${projectPath}?embed=1&theme=dark&file=${file}&hideExplorer=0&terminalHeight=0`;

  return (
    <iframe
      src={src}
      title="StackBlitz demo"
      style={{ width: "100%", height: `${height}px`, border: 0, borderRadius: "0.5rem" }}
      allow="cross-origin-isolated"
    />
  );
}
