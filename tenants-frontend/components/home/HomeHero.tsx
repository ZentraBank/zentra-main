import React from "react";

export default function ZentraBankIntro() {
  return (
    <div className="relative h-[852px] w-96 overflow-hidden bg-white">
      <div className="absolute left-[-12px] top-[377px] h-[489px] w-96 bg-gradient-to-br from-red-600 via-black/90 to-black/90 shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.24)]" />

      <div className="absolute left-0 top-[377px] h-96 w-96 bg-gradient-to-l from-white via-neutral-500 to-black" />

      <h1 className="absolute left-0 top-[84px] w-96 text-center font-['SF_Pro'] text-5xl leading-10 tracking-widest text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1.00)]">
        ZentraBank <br />
        Online Banking
      </h1>

      <p className="absolute left-[43px] top-[180px] w-80 text-center font-['Lato'] text-lg font-normal leading-5 tracking-tight text-black/95">
        Welcome to the one-stop app that can help make your work easier on the
        street - this is the only app where you find so many billing format and
        lots more loading, even as a newbie...
      </p>

      <button className="absolute left-[71px] top-[676px] inline-flex w-64 items-center justify-center gap-2.5 rounded-xl bg-blue-800 px-4 py-2 shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.10)]">
        <span className="font-['Roboto'] text-base font-medium text-white">
          See more
        </span>

        <span className="relative h-5 w-5 overflow-hidden">
          <span className="absolute left-[2px] top-[3px] h-3 w-4 border border-white bg-stone-900/30" />
        </span>
      </button>

      <div className="absolute left-0 top-0 inline-flex w-96 items-center justify-between rounded-b-lg bg-white px-6 py-2">
        <div className="flex-1 font-['Lato'] text-sm font-bold leading-4 tracking-tight text-stone-900/80">
          19:04
        </div>

        <div className="flex max-w-20 flex-1 items-center justify-center gap-1 self-stretch">
          <div className="relative w-4 self-stretch overflow-hidden">
            <div className="absolute left-[6.80px] top-[10.40px] h-[3.20px] w-[3.40px] bg-stone-900/80" />
            <div className="absolute left-[0.85px] top-[2.40px] h-2 w-4 bg-stone-900/80" />
          </div>

          <div className="relative w-4 self-stretch overflow-hidden">
            <div className="absolute left-[0.75px] top-[0.87px] h-3.5 w-4 bg-stone-900/80" />
          </div>

          <div className="relative w-5 self-stretch overflow-hidden">
            <div className="absolute left-[1.60px] top-[4px] h-3 w-5 bg-stone-900/80" />
          </div>
        </div>
      </div>
    </div>
  );
}