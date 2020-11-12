import { LoadingOutlined, ShrinkOutlined } from "@ant-design/icons";
import { Button, PageHeader, Spin, Tabs } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { Filters } from "../Filters/Filters";
import { Table } from "../Table/Table";
import { TabTitle } from "./tabs-pane";
import { TablePanel } from "./tabs-panel";
import { TabsStyles } from "./Tabs.styles";

const getTabPaneProps = (view, data) => ({
  key: view.key,
  closable: false,
  tab: <TabTitle item={view} data={data} />,
});

const TabContent = observer(({ views, view, data, columns }) => {
  const dataMemo = React.useMemo(() => Array.from(data), [
    data,
    view.dataStore.loading,
    view.dataStore.loaded,
  ]);

  return (
    <Table
      key={`data-${view.target}`}
      view={view}
      data={dataMemo}
      columns={columns}
      hiddenColumns={view.hiddenColumnsList}
    />
  );
});

const createTab = (views, data, columns) => (view) => {
  return (
    <Tabs.TabPane {...getTabPaneProps(view, data)}>
      <TablePanel views={views} view={view} />
      {view.dataStore.loaded ? (
        <TabContent view={view} views={views} data={data} columns={columns} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Spin indicator={<LoadingOutlined />} size="large" />
        </div>
      )}
    </Tabs.TabPane>
  );
};

const FiltersSidebar = observer(({ views }) => {
  return views.sidebarEnabled && views.sidebarVisible ? (
    <div className="sidebar">
      <PageHeader
        title="Filters"
        extra={
          <Button
            key="close-filters"
            type="link"
            onClick={() => views.collapseFilters()}
          >
            <ShrinkOutlined />
          </Button>
        }
        style={{
          margin: "0 0 10px",
          padding: "0 10px",
          height: 24,
        }}
      />
      <Filters sidebar={true} />
    </div>
  ) : null;
});

export const TabsWrapper = inject("store")(
  observer(({ store }) => {
    const views = store.viewsStore;
    const activeTab = store.viewsStore.selected;
    const columns = React.useMemo(() => {
      return activeTab.fieldsAsColumns;
    }, [activeTab, activeTab.target]);

    return (
      <TabsStyles>
        <Tabs
          type="editable-card"
          activeKey={activeTab.key}
          onEdit={() => store.viewsStore.addView()}
          onChange={(key) => store.viewsStore.setSelected(key)}
        >
          {store.viewsStore.all.map(
            createTab(views, store.dataStore.list, columns)
          )}
        </Tabs>
        <FiltersSidebar views={views} />
      </TabsStyles>
    );
  })
);
