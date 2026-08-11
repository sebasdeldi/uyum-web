import { useParams } from "@tanstack/react-router";
import MintOperationInfo from "./MintOperationInfo";

function MintOperationRoute() {
  const { id } = useParams({ from: "/authenticated/mint-operation/$id" });
  return <MintOperationInfo id={id} />;
}

export default MintOperationRoute;
