import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw, FiRepeat, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import usePageTitle from '../hooks/usePageTitle';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import categoryService from '../services/categoryService';
import subscriptionService from '../services/subscriptionService';
import { useCurrency } from '../contexts/CurrencyContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  margin-top: 80px;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 60px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0.5rem 0 0 0;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.color || '#e2e8f0'};
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const SummaryValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
`;

const ItemList = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const SubItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  opacity: ${props => props.active ? 1 : 0.6};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8fafc;
  }
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Desc = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const Meta = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Amount = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 1.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.edit && `
    background: #eff6ff;
    color: #3b82f6;
    &:hover { background: #dbeafe; }
  `}
  
  ${props => props.delete && `
    background: #fef2f2;
    color: #ef4444;
    &:hover { background: #fee2e2; }
  `}
`;

// Modals...
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: #4f46e5;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-left: 1rem;
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
`;

const Subscriptions = () => {
    usePageTitle('Subscriptions | BudgetWise');
    const { format: formatCurrency } = useCurrency();
    const [subscriptions, setSubscriptions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date().toISOString().split('T')[0],
        categoryId: '',
        active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [subs, cats] = await Promise.all([
                subscriptionService.getSubscriptions(),
                categoryService.getCategories()
            ]);
            setSubscriptions(subs);
            setCategories(cats);
            if (cats.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const payload = {
                ...formData,
                categoryId: parseInt(formData.categoryId)
            };

            if (editingSub) {
                await subscriptionService.updateSubscription(editingSub.id, payload);
            } else {
                await subscriptionService.createSubscription(payload);
            }
            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (sub) => {
        setEditingSub(sub);
        setFormData({
            name: sub.name,
            amount: sub.amount.toString(),
            billingCycle: sub.billingCycle,
            nextBillingDate: sub.nextBillingDate,
            categoryId: sub.category.id,
            active: sub.active
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setIsLoading(true);
            await subscriptionService.deleteSubscription(deleteId);
            await loadData();
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSub(null);
        setFormData({
            name: '',
            amount: '',
            billingCycle: 'MONTHLY',
            nextBillingDate: new Date().toISOString().split('T')[0],
            categoryId: categories[0]?.id || '',
            active: true
        });
    };

    const totalMonthly = subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + (s.billingCycle === 'MONTHLY' ? parseFloat(s.amount) : parseFloat(s.amount) / 12), 0);

    const totalYearly = totalMonthly * 12;

    return (
        <Container>
            <Header>
                <div>
                    <Title>Subscriptions</Title>
                    <Subtitle>Manage your recurring payments and bills</Subtitle>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <FiPlus /> Add Subscription
                </Button>
            </Header>

            <SummaryGrid>
                <SummaryCard color="#4f46e5">
                    <SummaryLabel>Monthly Cost</SummaryLabel>
                    <SummaryValue>{formatCurrency(totalMonthly)}</SummaryValue>
                </SummaryCard>
                <SummaryCard color="#10b981">
                    <SummaryLabel>Yearly Equivalent</SummaryLabel>
                    <SummaryValue>{formatCurrency(totalYearly)}</SummaryValue>
                </SummaryCard>
                <SummaryCard color="#f59e0b">
                    <SummaryLabel>Active Subscriptions</SummaryLabel>
                    <SummaryValue>{subscriptions.filter(s => s.active).length}</SummaryValue>
                </SummaryCard>
            </SummaryGrid>

            <ItemList>
                {subscriptions.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No subscriptions found. Click "Add Subscription" to create one.
                    </div>
                ) : (
                    subscriptions.map(sub => (
                        <SubItem key={sub.id} active={sub.active}>
                            <Info>
                                <IconWrapper><FiRepeat /></IconWrapper>
                                <Details>
                                    <Desc>{sub.name} {!sub.active && '(Cancelled)'}</Desc>
                                    <Meta>
                                        <span>{sub.category.name}</span> • 
                                        <span>{sub.billingCycle}</span> • 
                                        <span>Next: {sub.nextBillingDate}</span>
                                    </Meta>
                                </Details>
                            </Info>
                            <Amount>{formatCurrency(sub.amount)}</Amount>
                            <Actions>
                                <ActionButton edit onClick={() => handleEdit(sub)}>
                                    <FiEdit2 />
                                </ActionButton>
                                <ActionButton delete onClick={() => setDeleteId(sub.id)}>
                                    <FiTrash2 />
                                </ActionButton>
                            </Actions>
                        </SubItem>
                    ))
                )}
            </ItemList>

            {showModal && (
                <Modal>
                    <ModalContent>
                        <h2>{editingSub ? 'Edit Subscription' : 'Add Subscription'}</h2>
                        <form onSubmit={handleSubmit}>
                            <FormGroup>
                                <label>Name</label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </FormGroup>
                            <FormGroup>
                                <label>Amount</label>
                                <Input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                            </FormGroup>
                            <FormGroup>
                                <label>Category</label>
                                <Select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <label>Billing Cycle</label>
                                <Select required value={formData.billingCycle} onChange={e => setFormData({...formData, billingCycle: e.target.value})}>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <label>Next Billing Date</label>
                                <Input required type="date" value={formData.nextBillingDate} onChange={e => setFormData({...formData, nextBillingDate: e.target.value})} />
                            </FormGroup>
                            <FormGroup style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                                <label style={{ margin: 0 }}>Active</label>
                            </FormGroup>
                            
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <SecondaryButton type="button" onClick={handleCloseModal}>Cancel</SecondaryButton>
                                <PrimaryButton type="submit" disabled={isLoading}>Save</PrimaryButton>
                            </div>
                        </form>
                    </ModalContent>
                </Modal>
            )}

            <ConfirmationModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={handleDelete} 
                title="Delete Subscription" 
                message="Are you sure you want to delete this? The generated past transactions will not be deleted." 
                confirmText="Delete" 
                type="danger" 
                isLoading={isLoading} 
            />
        </Container>
    );
};

export default Subscriptions;
