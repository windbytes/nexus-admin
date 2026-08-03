/**
 * @name: ContentCompact
 */
import { theme } from 'antd';

const { useToken } = theme;
export default function ContentCompact() {
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
        <rect id="svg_8" fill={token.colorPrimary} height="9.07" stroke="null" width="104.08" x="-0.07" y="-0.06" />
        <rect id="svg_3" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="15.58" y="3.21" />
        <path
          id="svg_12"
          d="m98.2,2.872c0,-0.54 0.46,-1 1,-1l1.925,0c0.54,0 1,0.46 1,1l0,2.4c0,0.54 -0.46,1 -1,1l-1.925,0c-0.54,0 -1,-0.46 -1,-1l0,-2.4z"
          fill="#ffffff"
          opacity="undefined"
          stroke="null"
        />
        <rect
          id="svg_13"
          fill="currentColor"
          fillOpacity="0.08"
          height="21.52"
          rx="2"
          stroke="null"
          width="41.98"
          x="45.38"
          y="13.53"
        />
        <path
          id="svg_14"
          d="m16.41,15.53c0,-1.09 0.74,-2 1.62,-2l21.75,0c0.88,0 1.62,0.91 1.62,2l0,17.25c0,1.09 -0.74,2 -1.62,2l-21.75,0c-0.88,0 -1.62,-0.91 -1.62,-2l0,-17.25z"
          fill="currentColor"
          fillOpacity="0.08"
          opacity="undefined"
          stroke="null"
        />
        <rect
          id="svg_15"
          fill="currentColor"
          fillOpacity="0.08"
          height="21.65"
          rx="2"
          stroke="null"
          width="71.11"
          x="16.55"
          y="39.35"
        />
        <rect id="svg_21" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="28.15" y="3.07" />
        <rect id="svg_22" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="41.26" y="3.21" />
        <rect id="svg_23" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="54.23" y="3.07" />
        <rect id="svg_4" fill="#ffffff" height="7.14" rx="2" stroke="null" width="7.78" x="1.53" y="0.881" />
      </g>
    </svg>
  );
}
