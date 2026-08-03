import { theme } from 'antd';

const { useToken } = theme;

/**
 * @name HeaderMixedNav
 */
export default function HeaderMixedNav() {
  const { token } = useToken();
  return (
    <svg className="custom-radio-image" fill="none" height="66" width="104" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect
          id="svg_1"
          fill="currentColor"
          fillOpacity="0.02"
          height="66"
          rx="4"
          stroke="null"
          width="104"
          x="0.14"
          y="0.14"
        />
        <path
          id="svg_2"
          d="m-3.38,3.75a1.93,4.02 0 0 1 1.93,-4.02l11.35,0l0,66.41l-11.35,0a1.93,4.02 0 0 1 -1.93,-4.02l0,-58.36z"
          fill={token.colorPrimary}
          stroke="null"
        />
        <rect id="svg_3" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="5.47" x="1.64" y="15.46" />
        <rect id="svg_4" fill="#ffffff" height="7.68" rx="2" stroke="null" width="8.19" x="0.59" y="1.42" />
        <rect
          id="svg_8"
          fill="hsl(var(--primary))"
          height="9.07"
          rx="2"
          stroke="null"
          width="75.92"
          x="25.38"
          y="1.43"
        />
        <rect id="svg_9" fill="#b2b2b2" height="4.4" rx="1" stroke="null" width="3.925" x="27.92" y="3.69" />
        <rect id="svg_10" fill="#b2b2b2" height="4.4" rx="1" stroke="null" width="3.925" x="80.75" y="3.63" />
        <rect id="svg_11" fill="#b2b2b2" height="4.4" rx="1" stroke="null" width="3.925" x="87.79" y="3.7" />
        <rect id="svg_12" fill="#b2b2b2" height="4.4" rx="1" stroke="null" width="3.925" x="94.68" y="3.63" />
        <rect
          id="svg_13"
          fill="currentColor"
          fillOpacity="0.08"
          height="21.52"
          rx="2"
          stroke="null"
          width="42.93"
          x="58.75"
          y="14.613"
        />
        <rect
          id="svg_14"
          fill="currentColor"
          fillOpacity="0.08"
          height="20.98"
          rx="2"
          stroke="null"
          width="28.37"
          x="26.14"
          y="14.613"
        />
        <rect
          id="svg_15"
          fill="currentColor"
          fillOpacity="0.08"
          height="21.65"
          rx="2"
          stroke="null"
          width="75.09"
          x="26.34"
          y="39.69"
        />
        <rect id="svg_5" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="5.47" x="1.8" y="28.39" />
        <rect id="svg_6" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="5.47" x="1.64" y="41.8" />
        <rect id="svg_7" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="5.47" x="1.64" y="55.37" />
        <rect
          id="svg_16"
          fill="currentColor"
          fillOpacity="0.08"
          height="65.72"
          stroke="null"
          width="12.49"
          x="9.85"
          y="-0.03"
        />
        <rect id="svg_21" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="35.15" y="4.07" />
        <rect id="svg_22" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="47.26" y="4.21" />
        <rect id="svg_23" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="59.23" y="4.07" />
      </g>
    </svg>
  );
}
