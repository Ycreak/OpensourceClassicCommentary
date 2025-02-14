import { Component, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import {ChangeDetectionStrategy} from '@angular/core';
import { MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';


interface TaxonNode {
  linnaeus_id: number;
  name: string;
  parent_id: number | null;
}

interface TaxonFlatNode {
  linnaeus_id: number;
  name: string;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [ 
    CommonModule,
    MatTreeModule, MatIconModule, MatButtonModule 
  ],
    changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss'
})
export class TreeComponent implements OnChanges {
    @Input() newTaxonomicData: any;
    @Output() request_children = new EventEmitter<string>();
    @Output() request_child = new EventEmitter<string>();
    protected taxonomicData = [];

    private _transformer = (node: TaxonNode, level: number) => {
    const children = this.getChildren(node.linnaeus_id);
    return {
      linnaeus_id: node.linnaeus_id,
      name: node.name,
      level: level,
      expandable: children.length > 0
    };
  };

  treeControl = new FlatTreeControl<TaxonFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => this.getChildren(node.linnaeus_id)
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
  }

  getChildren(id: number): TaxonNode[] {
    return this.taxonomicData.filter(node => node.parent_id === id);
  }

  ngOnChanges(): void {
    //console.log('new', this.newTaxonomicData)
    this.taxonomicData = this.taxonomicData.concat(this.newTaxonomicData);

    // Remove duplicates based on the entire object
    this.taxonomicData = Array.from(new Set(this.taxonomicData.map(a => JSON.stringify(a))))
                              .map(e => JSON.parse(e))

    // Sort the unique list by 'name'
    this.taxonomicData = this.taxonomicData.sort((a, b) => a.name.localeCompare(b.name));

    const nodeMap = new Map<number, TaxonNode>();
    this.taxonomicData.forEach(node => nodeMap.set(node.linnaeus_id, node));

    const rootNodes = this.taxonomicData.filter(node => node.parent_id === null);
    this.dataSource.data = rootNodes;
    //this.taxonomicData =  
    const expandAll = () => {
      const nodes = this.treeControl.dataNodes;
      for (const node of nodes) {
        if (node.expandable) {
          this.treeControl.expand(node);
        }
      }
    };

    // Wait for initial data load
    setTimeout(expandAll, 0);
  }

  hasChild = (_: number, node: TaxonFlatNode): boolean => {
    return node.expandable;
  };
}
