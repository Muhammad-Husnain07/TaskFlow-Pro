import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Modal,
  Badge,
  Avatar,
  AvatarGroup,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Tooltip,
  Spinner,
  Skeleton,
  EmptyState,
} from '../ui';

const UIDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('');

  const demoUsers = [
    { name: 'John Doe', src: null },
    { name: 'Jane Smith', src: null },
    { name: 'Mike Johnson', src: null },
    { name: 'Sarah Wilson', src: null },
    { name: 'Tom Brown', src: null },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-heading font-bold">UI Components Demo</h1>
        <p className="text-gray-500 mt-2">Storybook-style showcase of all UI components</p>
      </div>

      {/* Button Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>

      {/* Input Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Input
            label="Basic Input"
            placeholder="Enter text..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            label="With Prefix"
            prefix={<span className="text-gray-400">$</span>}
            placeholder="0.00"
          />
          <Input
            label="With Suffix"
            suffix={<span className="text-gray-400">.00</span>}
            placeholder="Amount"
          />
          <Input
            label="Error State"
            error="This field is required"
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            placeholder="Enter value..."
          />
        </div>
        <div className="mt-4 max-w-2xl">
          <Textarea
            label="Textarea"
            placeholder="Enter description..."
            rows={3}
          />
        </div>
      </section>

      {/* Modal Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Modal</h2>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Example Modal"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => setShowModal(false)}>Confirm</Button>
            </>
          }
        >
          <p className="text-gray-600 dark:text-gray-400">
            This is a modal example with title, content, and footer buttons.
            It uses React Portal to render outside the DOM hierarchy.
          </p>
        </Modal>
      </section>

      {/* Badge Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Badge showDot variant="primary">With Dot</Badge>
          <Badge size="sm" variant="success">Small</Badge>
          <Badge size="md" variant="warning">Medium</Badge>
        </div>
      </section>

      {/* Avatar Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Avatars</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Avatar size="xs" alt="John" />
          <Avatar size="sm" alt="John" />
          <Avatar size="md" alt="John Doe" />
          <Avatar size="lg" alt="John" />
          <Avatar size="xl" alt="John Doe" />
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Avatar Group</h3>
          <AvatarGroup max={3}>
            {demoUsers.map((user, i) => (
              <Avatar key={i} alt={user.name} size="md" />
            ))}
          </AvatarGroup>
        </div>
      </section>

      {/* Dropdown Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Dropdown</h2>
        <div className="flex flex-wrap gap-4">
          <Dropdown
            trigger={<Button>Click Me</Button>}
          >
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem danger>Logout</DropdownItem>
          </Dropdown>
          <Dropdown
            align="right"
            trigger={<Button variant="secondary">Align Right</Button>}
          >
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
        </div>
      </section>

      {/* Tooltip Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tooltips</h2>
        <div className="flex flex-wrap gap-6 items-center">
          <Tooltip content="Top Tooltip" position="top">
            <Button>Top</Button>
          </Tooltip>
          <Tooltip content="Bottom Tooltip" position="bottom">
            <Button variant="secondary">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left Tooltip" position="left">
            <Button variant="outline">Left</Button>
          </Tooltip>
          <Tooltip content="Right Tooltip" position="right">
            <Button variant="ghost">Right</Button>
          </Tooltip>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Loading States</h2>
        <div className="flex flex-wrap gap-6 items-center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <Skeleton variant="card" />
          <Skeleton variant="image" />
          <Skeleton variant="avatar" />
        </div>
        <div className="mt-6 max-w-md">
          <SkeletonText lines={4} />
        </div>
      </section>

      {/* Empty State */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Empty State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <EmptyState
            title="No Data"
            description="There is no data to display at the moment."
          />
          <EmptyState
            icon={<span className="text-2xl">📁</span>}
            title="No Files"
            description="Upload your first file to get started."
            action={<Button>Upload File</Button>}
          />
        </div>
      </section>
    </div>
  );
};

export default UIDemo;