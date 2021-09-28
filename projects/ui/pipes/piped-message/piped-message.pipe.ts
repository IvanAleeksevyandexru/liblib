import { Pipe, PipeTransform } from '@angular/core';
import { PipedMessage, PipeLine, PipedParameters } from '@epgu/ui/models/piped-message';

@Pipe({
  name: 'pipedMessage',
  pure: false // impure пайп т.к. практически все темплейты будут начинаться с |translate. нет смысла делать pure
})
export class PipedMessagePipe implements PipeTransform {

  constructor() {
  }

  public transform(inputValue: PipedMessage | any,
                   parameters?: PipedParameters | { [key: string]: any },
                   inputTemplate?: PipeLine): any {

    const message = inputValue as PipedMessage;
    const value = inputValue && inputValue instanceof PipedMessage ? message.value : inputValue;
    const template = inputTemplate || (inputValue instanceof PipedMessage) ? message.template : null;
    let pipeParameters: PipedParameters = parameters instanceof PipedParameters ? parameters : new PipedParameters(parameters);
    if (inputValue instanceof PipedMessage) {
      pipeParameters = message.parameters.join(pipeParameters);
    }
    return PipeLine.processPipeLine(value, template, pipeParameters);

  }

}
