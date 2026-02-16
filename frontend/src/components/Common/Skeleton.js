import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonBase = styled.div`
  background: #e2e8f0;
  background-image: linear-gradient(
    90deg,
    #e2e8f0 0px,
    #f1f5f9 40px,
    #e2e8f0 80px
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 4px;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '1em'};
  margin-bottom: ${props => props.mb || '0'};

  [data-theme='dark'] & {
    background: #1e293b;
    background-image: linear-gradient(
      90deg,
      #1e293b 0px,
      #334155 40px,
      #1e293b 80px
    );
  }

  ${props => props.variant === 'circle' && css`
    border-radius: 50%;
    width: ${props => props.width || '40px'};
    height: ${props => props.height || '40px'};
  `}

  ${props => props.variant === 'text' && css`
    height: 1em;
    border-radius: 4px;
  `}
  
  ${props => props.variant === 'rect' && css`
    height: ${props => props.height || '100px'};
    border-radius: 8px;
  `}
`;

const Skeleton = ({ variant = 'text', width, height, mb, style }) => {
    return (
        <SkeletonBase
            variant={variant}
            width={width}
            height={height}
            mb={mb}
            style={style}
        />
    );
};

export default Skeleton;
