import React from "react";
type Props = {
  title: string;
};

const BodyHeader = ({ title }: Props) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-primary">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Accent line touching left border */}
        <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

        {/* Title */}
        <div>
          <h5 className=" sm:text-xl text-white/60">{title}</h5>
        </div>
      </div>
    </div>
  );
};

export default BodyHeader;
