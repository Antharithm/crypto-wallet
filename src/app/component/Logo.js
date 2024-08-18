import Image from "next/image";

export default function Logo({ asset }) {
  return (
    <Image
      className="me-2"
      src={asset.logo}
      alt={asset.name}
      width={20}
      height={20}
    />
  );
}
