import { useEffect, useMemo, useRef, useState } from "react";
import MachineBarcode from "../MachineBarcode/MachineBarcode";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import useBarcode from "../../hooks/useBarcode";
import * as THREE from "three";

interface IMachine3D {
  item: {
    barcode: string;
    waypoint: {
      x: number;
      y: number;
      z: number;
      yaw?: number;
    };
  };
}

export default function Machine3D({ item }: IMachine3D) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const meshRef: any = useRef();
  const { findBarcodeInput } = useBarcode();

  const { camera } = useThree();
  const frustum: any = useMemo(() => new THREE.Frustum(), []);
  const [isBoxInFrustum, setIsBoxInFrustum] = useState(true);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.updateMatrixWorld();

    frustum.setFromMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    if (frustum.intersectsObject(meshRef.current)) {
      setIsBoxInFrustum(true);
    } else {
      setIsBoxInFrustum(false);
    }
  });

  const [key, setKey] = useState(0);

  useEffect(() => {
    //get random number between 0 and 1000
    const randomNumber = Math.floor(Math.random() * 1000);
    setKey(randomNumber);
  }, [findBarcodeInput]);

  if (!isBoxInFrustum) {
    return null;
  }

  return (
    <mesh
      key={key}
      onPointerEnter={() => !hovered && setHovered(true)}
      onPointerLeave={() => hovered && setHovered(false)}
      scale={1}
      position={[
        item?.waypoint?.y,
        item?.waypoint?.z * 0.6 + 0.3,
        item?.waypoint?.x,
      ]}
      rotation={[0, item?.waypoint?.yaw || 0, 0]}
    >
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshNormalMaterial
        transparent={
          findBarcodeInput
            ? item.barcode === findBarcodeInput
              ? false
              : true
            : false
        }
        opacity={
          findBarcodeInput ? (item.barcode === findBarcodeInput ? 1 : 0.1) : 1
        }
      />
      {hovered && (
        <group>
          {/* Front Face */}
          <Html
            className="relative inset-0 flex h-full w-full flex-col items-center justifcony-center"
            distanceFactor={1.5}
            position={[0, 0.1, -0.301]}
            transform
            occlude
          >
            <MachineBarcode barcode={item.barcode} />
          </Html>
          {/* Front Face */}

          {/* Back Face */}
          <Html
            className="relative inset-0 flex h-full w-full flex-col items-center justify-center"
            distanceFactor={1.5}
            position={[0, 0.1, 0.301]}
            transform
            occlude
          >
            <MachineBarcode barcode={item.barcode} />
          </Html>
          {/* Back Face */}

          {/* Right Face */}
          <Html
            className="relative inset-0 flex h-full w-full flex-col items-center justify-center"
            distanceFactor={1.5}
            position={[0.301, 0.1, 0]}
            rotation={[0, Math.PI / 2, 0]}
            transform
            occlude
          >
            <MachineBarcode barcode={item.barcode} />
          </Html>
          {/* Right Face */}

          {/* Left Face */}
          <Html
            className="relative inset-0 flex h-full w-full flex-col items-center justify-center"
            distanceFactor={1.5}
            position={[-0.301, 0.1, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            transform
            occlude
          >
            <MachineBarcode barcode={item.barcode} />
          </Html>
          {/* Left Face */}
        </group>
      )}
    </mesh>
  );
}
