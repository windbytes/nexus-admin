import { theme } from 'antd';

const { useToken } = theme;
/**
 * @name: HeaderSidebarNav.tsx
 */
export default function HeaderSidebarNav() {
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
        <rect
          id="svg_8"
          fill="currentColor"
          fillOpacity="0.08"
          height="9.07"
          stroke="null"
          width="104.08"
          x="-0.07"
          y="-0.06"
        />
        <rect id="svg_3" fill="#b2b2b2" height="1.689" rx="1.395" stroke="null" width="6.52" x="10.08" y="3.51" />
        <rect id="svg_10" fill="#b2b2b2" height="4.4" rx="1" stroke="null" width="3.925" x="80.75" y="2.89" />
        <rect id="svg_11" fill="#b2b2b2" height="4.4" rx="1" stroke="null" width="3.925" x="87.58" y="2.89" />
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
          width="44.13"
          x="53.38"
          y="13.46"
        />
        <path
          id="svg_14"
          d="m19.44,15.74c0,-1.09 0.79,-2 1.73,-2l23.19,0c0.94,0 1.73,0.91 1.73,2l0,17.25c0,1.09 -0.79,2 -1.73,2l-23.19,0c-0.94,0 -1.73,-0.91 -1.73,-2l0,-17.25z"
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
          width="78.39"
          x="19.94"
          y="39.35"
        />
        <rect id="svg_21" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="28.15" y="3.07" />
        <rect id="svg_22" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="41.26" y="3.21" />
        <rect id="svg_23" fill="#e5e5e5" height="2.789" rx="1.395" stroke="null" width="7.52" x="54.23" y="3.07" />
        <rect id="svg_4" fill="#ffffff" height="5.14" rx="2" stroke="null" width="5.78" x="1.53" y="1.081" />
        <rect id="svg_5" fill={token.colorPrimary} height="56.81" stroke="null" width="15.45" x="-0.06" y="9.03" />
        <path
          id="svg_2"
          d="m2.39,15.38c0,-0.2 0.27,-0.38 0.6,-0.38l7.98,0c0.32,0 0.6,0.17 0.6,0.38l0,3.24c0,0.2 -0.27,0.38 -0.6,0.38l-7.98,0c-0.32,0 -0.6,-0.17 -0.6,-0.38l0,-3.24z"
          fill="#fff"
          opacity="undefined"
          stroke="null"
        />
        <path
          id="svg_6"
          d="m2.39,28.43c0,-0.2 0.27,-0.38 0.6,-0.38l7.98,0c0.32,0 0.6,0.17 0.6,0.38l0,3.24c0,0.2 -0.27,0.38 -0.6,0.38l-7.98,0c-0.32,0 -0.6,-0.17 -0.6,-0.38l0,-3.24z"
          fill="#fff"
          opacity="undefined"
          stroke="null"
        />
        <path
          id="svg_7"
          d="m2.18,41.28c0,-0.2 0.27,-0.38 0.6,-0.38l7.98,0c0.32,0 0.6,0.17 0.6,0.38l0,3.24c0,0.2 -0.27,0.38 -0.6,0.38l-7.98,0c-0.32,0 -0.6,-0.17 -0.6,-0.38l0,-3.24z"
          fill="#fff"
          opacity="undefined"
          stroke="null"
        />
        <path
          id="svg_9"
          d="m2.18,54.33c0,-0.2 0.27,-0.38 0.6,-0.38l7.98,0c0.32,0 0.6,0.17 0.6,0.38l0,3.24c0,0.2 -0.27,0.38 -0.6,0.38l-7.98,0c-0.32,0 -0.6,-0.17 -0.6,-0.38l0,-3.24z"
          fill="#fff"
          opacity="undefined"
          stroke="null"
        />
      </g>
    </svg>
  );
}
