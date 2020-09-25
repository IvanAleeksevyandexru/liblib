import { ListItem, ListElement, AutocompleteSuggestion } from '../../models/dropdown.model';
import { HelperService } from '../helper/helper.service';

class ListItemGroup {
  public children: Array<ListItemGroup> = [];
  public header: ListItem;
  public find(item: ListItem) {
    return this.children.find((groupEl: ListItemGroup) => groupEl.header === item);
  }
  public add(item: ListItem): ListItemGroup {
    const existing = this.find(item);
    if (existing) {
      return existing;
    } else {
      const groupEl = new ListItemGroup();
      groupEl.header = item;
      this.children.push(groupEl);
      return groupEl;
    }
  }
  public out(level: number, path: Array<ListItem>, dest: Array<ListItem>) {
    if (this.header) {
      this.header.groupLevel = level;
      this.header.collapsable = !!this.children.length;
      this.header.hidden = path.some((item: ListItem) => item.collapsed);
      dest.push(this.header);
    }
    this.children.forEach((subGroup: ListItemGroup) => {
      subGroup.out(level + 1, this.header ? [].concat(path).concat(this.header) : path, dest);
    });
  }
}

export class ListItemHierarchyService {

  public static isHierarchyList(list: Array<ListItem>) {
    return list && list.length && list.some((item: ListItem) => item.groupId);
  }

  public static alignGroupsTreeIfNeeded(filteredItems: Array<ListItem>, availableItems: Array<ListItem>,
                                        virtualGroupsState: boolean, collapsableGroupsState: boolean): Array<ListItem> {
    if (ListItemHierarchyService.isHierarchyList(filteredItems)) {
      const hierarchyAligned = ListItemHierarchyService.alignGroupsTree(filteredItems, availableItems);
      if (collapsableGroupsState) {
        hierarchyAligned.filter((item: ListItem) => item.collapsable).forEach((item: ListItem) => {
          (item as any).collapse = () => ListItemHierarchyService.collapseNode(item, availableItems);
          (item as any).expand = () => ListItemHierarchyService.expandNode(item, availableItems);
        });
      }
      ListItemHierarchyService.adjustVirtualGroupsSelectionIfNeeded(hierarchyAligned, virtualGroupsState);
      const appended = ListItemHierarchyService.findAppended(hierarchyAligned, filteredItems);
      appended.forEach((appendedItem: ListItem) => {
        appendedItem.resetHighlighting();
      });
      HelperService.copyArrayToArray(hierarchyAligned, filteredItems);
    }
    return filteredItems;
  }

  public static adjustVirtualGroupsSelectionIfNeeded(list: Array<ListItem>, virtualGroupsState: boolean, rootElement?: ListItem) {
    if (virtualGroupsState === false) {
      return; // если группы можно выделять как обычные итемы - мы не позволяем регулирование их выделения кроме как пользователем
    }
    const elements = rootElement ? ListItemHierarchyService.getChildrenAligned(rootElement, list, rootElement.groupLevel + 1) :
      list.filter((listElement: ListItem) => listElement.groupLevel === 1);
    elements.forEach((listElement: ListItem) => {
      if (listElement.collapsable) {
        ListItemHierarchyService.adjustVirtualGroupsSelectionIfNeeded(list, virtualGroupsState, listElement);
      }
    });
    if (rootElement && rootElement.collapsable) {
      rootElement.selected = virtualGroupsState === null ? false : elements.every((child: ListItem) => child.selected);
    }
  }

  public static complementMissingGroupContentsIfNeeded(list: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    if (ListItemHierarchyService.isHierarchyList(availableItems)) {
      const filteredGroups = list.filter((filtered: ListItem) => filtered.collapsable);
      const filteredGroupsContents = ListItemHierarchyService.collectChildren(filteredGroups, availableItems);
      const groupContents = filteredGroupsContents.filter((missingItem: ListItem) => !list.includes(missingItem));
      return ListItemHierarchyService.alignGroupsTree(list.concat(groupContents), availableItems);
    } else {
      return list;
    }
  }

  public static getTerminalItems(root: ListItem, list: Array<ListItem>): Array<ListItem> {
    const children = ListItemHierarchyService.getChildrenAligned(root, list);
    return children.filter((item: ListItem) => !item.collapsable);
  }

  public static expandCollapseNode(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    if (!switchedElement.collapsable) {
      return;
    }
    switchedElement.collapsed = !switchedElement.collapsed;
    const itemChildren = ListItemHierarchyService.getChildrenAligned(switchedElement, list);
    const parents = [switchedElement];
    itemChildren.forEach((childItem: ListItem) => {
      const deltaLev = childItem.groupLevel - switchedElement.groupLevel;
      parents[deltaLev] = childItem;
      childItem.hidden = parents.slice(0, childItem.groupLevel - 1).some((parent) => parent.collapsed);
    });
    if (evt) {
      evt.stopPropagation();
    }
  }

  public static expandNode(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    if (switchedElement.collapsed) {
      ListItemHierarchyService.expandCollapseNode(switchedElement, list);
    }
    if (evt) {
      evt.stopPropagation();
    }
  }

  public static collapseNode(switchedElement: ListItem, list: Array<ListItem>, evt?: Event) {
    if (!switchedElement.collapsed) {
      ListItemHierarchyService.expandCollapseNode(switchedElement, list);
    }
    if (evt) {
      evt.stopPropagation();
    }
  }

  private static alignGroupsTree(filteredItems: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    const treeView = new ListItemGroup();
    let unsorted = [].concat(filteredItems);
    const findGroup = (groupId: string | number): ListItem => {
      unsorted = unsorted.filter((item: ListItem) => item.id !== groupId);
      return availableItems.find((item: ListItem) => item.id === groupId);
    };
    const recoverPath = (item: ListItem) => {
      const itemPath = [findGroup(item.id)];
      let parentId = item.groupId;
      while (parentId !== undefined) {
        const pathIds = itemPath.map((pathEl: ListItem) => pathEl.id);
        if (pathIds.includes(parentId)) {
          break; // остановка рекурсии для некорректного (с циклами) графа связей
        }
        const parent = findGroup(parentId);
        itemPath.unshift(parent);
        parentId = parent.groupId;
      }
      let node = treeView;
      itemPath.forEach((pathFragment: ListItem) => {
        node = node.add(pathFragment);
      });
    };
    [].concat(unsorted).forEach((unsortedItem: ListItem) => {
      recoverPath(unsortedItem);
    });
    const output = [];
    treeView.out(0, [], output);
    return output;
  }

  private static findAppended(treeAligned: Array<ListItem>, initialList: Array<ListItem>): Array<ListItem> {
    const aligned = treeAligned;
    return aligned.filter((appendedItem: ListItem) => !initialList.includes(appendedItem));
  }

  private static getChildrenAligned(item: ListItem, treeAligned: Array<ListItem>, particularLevel?: number) {
    const children = [];
    const position = treeAligned.findIndex((someItem: ListItem) => someItem === item);
    if (position >= 0) {
      for (let i = position + 1; i < treeAligned.length; i++) {
        if (treeAligned[i].groupLevel <= item.groupLevel) {
          break;
        } else {
          if (particularLevel === undefined || treeAligned[i].groupLevel === particularLevel) {
            children.push(treeAligned[i]);
          }
        }
      }
    }
    return children;
  }

  private static collectChildren(items: Array<ListItem>, availableItems: Array<ListItem>): Array<ListItem> {
    const result = new Set<ListItem>();
    const put = (newItems: Array<ListItem>) => {
      newItems.forEach((item: ListItem) => result.add(item));
    };
    let collected = items;
    while (collected.length) {
      put(collected);
      collected = availableItems.filter((item: ListItem) => {
        return !result.has(item) && collected.some((collectedItem: ListItem) => item.groupId === collectedItem.id);
      });
    }
    return Array.from(result);
  }

}
