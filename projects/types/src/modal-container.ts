export class ModalContainer {
  public destroy: () => void = function (){};
}

// export function Modal() {
//   return target => {
//     (Object as any).assign(target.prototype, ModalContainer.prototype);
//   };
// }
