import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import "./DescriptionEditor.css"; // Create this CSS file
import { useState } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export default function DescriptionEditor({ value, onChange }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`description-editor-container transition-all duration-200 ${
        isFocused ? "border-[#d1d5db] shadow-sm" : "border-gray-200"
      }`}
      style={{ border: `1px solid ${isFocused ? "#d1d5db" : "#e2e8f0"}` }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Add description..."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
